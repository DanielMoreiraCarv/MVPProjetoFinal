package org.example.Fases;

import org.example.Models.Competicao;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.Fase;
import org.example.Models.Modalidade;
import org.example.Models.Equipe;
import org.example.Repositories.AtributoFaseRepository;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.ModalidadeRepository;
import org.example.Repositories.EquipeRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class ContratoDeFaseTest
{
    /**
     * O contrato é verificado contra a estratégia de grupos, e não contra um
 * dublê: o dublê existia porque `PONTOS_CORRIDOS` não tinha implementação e o
 * tipo estava livre. Com os três tipos implementados, um quarto registrado só
 * para teste colide no registro — e um contrato verificado contra a
 * implementação real vale mais do que contra uma inventada para passar.
 *
 * Estes testes falam com o Postgres do ambiente local. Sem ele no ar eles
     * falham, de propósito: teste que se ignora sozinho passa despercebido
     * justamente quando deveria acusar algo. A verificação aqui existe só para
     * a falha dizer o que fazer, em vez de estourar no meio da subida do
     * contexto do Spring.
     *
     * Remover essa dependência do ambiente é a tarefa F1.13, com Testcontainers.
     */
    @BeforeAll
    static void exigirBancoNoAr ()
    {
        try ( java.net.Socket sonda = new java.net.Socket() )
        {
            sonda.connect( new java.net.InetSocketAddress( "localhost", 5433 ), 500 );
        }
        catch ( java.io.IOException naoAlcancavel )
        {
            org.junit.jupiter.api.Assertions.fail(
                    "Postgres local indisponível em localhost:5433. Suba o ambiente antes de rodar os testes:"
                            + System.lineSeparator() + "  ./deploy/ambiente.sh subir" );
        }
    }

    @Autowired private OrquestradorDeFases orquestrador;
    @Autowired private RegistroDeEstrategias registro;
    @Autowired private EstrategiaDeGrupos estrategia;
    @Autowired private org.example.Repositories.PartidaRepository partidaRepository;
    @Autowired private AtributoFaseRepository atributoRepository;
    @Autowired private FaseRepository faseRepository;
    @Autowired private CompeticaoRepository competicaoRepository;
    @Autowired private EquipeRepository timeRepository;
    @Autowired private ModalidadeRepository modalidadeRepository;

    private Competicao competicao;

    @BeforeEach
    void prepararCampeonatoComQuatroTimes ()
    {
        Modalidade modalidade = modalidadeRepository.findByCodigo( "FUTEBOL_DE_CAMPO" )
                                                    .orElseGet( () -> modalidadeRepository
                                                            .save( new Modalidade( "FUTEBOL_DE_CAMPO",
                                                                    "Futebol de campo", 11 ) ) );

        List<Equipe> equipes = new ArrayList<>();
        for ( int i = 1; i <= 4; i++ )
        {
            Equipe equipe = new Equipe();
            equipe.setNome( "Equipe de teste " + i );
            equipe.setModalidade( modalidade );
            equipes.add( timeRepository.save( equipe ) );
        }

        competicao = new Competicao();
        competicao.setNome( "Competicao de teste do contrato" );
        competicao.setLstEquipes( equipes );
        competicao = competicaoRepository.save( competicao );
    }

    private Fase novaFase ()
    {
        Fase fase = new Fase();
        fase.setNome( "Fase de teste" );
        fase.setOrdem( 1 );
        fase.setFasePartida( EnumFasePartida.GRUPOS );
        fase.setCompeticao( competicao );
        return faseRepository.save( fase );
    }

    @Test
    void estrategiaEhResolvidaPeloTipoEstatico ()
    {
        assertTrue( registro.conhece( EnumFasePartida.GRUPOS ) );
        assertEquals( EnumFasePartida.GRUPOS,
                registro.para( EnumFasePartida.GRUPOS ).tipo() );
    }

    @Test
    void atributosDeclaradosPelaEstrategiaChegamNaTabela ()
    {
        List<String> codigos = atributoRepository
                .findByTipoFase( EnumFasePartida.GRUPOS ).stream()
                .map( a -> a.getCodigo() ).toList();

        assertTrue( codigos.contains( EstrategiaDeGrupos.TAMANHO_DO_GRUPO ) );
        assertTrue( codigos.contains( EstrategiaDeGrupos.IDA_E_VOLTA ) );
    }

    @Test
    void entradaDaPrimeiraFaseSaoOsTimesInscritosTodosEmpatados ()
    {
        List<Classificado> entrada = orquestrador.entradaDe( novaFase() );

        assertEquals( 4, entrada.size() );
        assertTrue( entrada.stream().allMatch( c -> c.posicao() == 1 ) );
    }

    /** Um grupo só, todos contra todos, mandante sempre vence. */
    private void jogarAteOFim ( Fase fase )
    {
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.TAMANHO_DO_GRUPO, "4" );
        orquestrador.configurar( fase );
        for ( var partida : partidaRepository.findByFaseId( fase.getId() ) )
        {
            partida.setPlacarMandante( 1 );
            partida.setPlacarVisitante( 0 );
            partida.setRealizada( true );
            partidaRepository.save( partida );
        }
    }

    @Test
    void valorEmBrancoApagaOAtributo ()
    {
        Fase fase = novaFase();
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "2" );
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.TAMANHO_DO_GRUPO, "2" );
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "" );

        assertTrue( orquestrador.validar( fase ).ehValido(),
                "trocar de número de grupos para tamanho do grupo ficava impossível" );
    }

    @Test
    void sucessoraRecebeSoOsClassificadosDaAnterior ()
    {
        Fase sucessora = novaFase();
        sucessora.setOrdem( 2 );
        sucessora.setFasePartida( EnumFasePartida.ELIMINATORIA );
        faseRepository.save( sucessora );

        Fase primeira = novaFase();
        primeira.setQuantidadeClassificados( 2 );
        primeira.setFaseSucessora( sucessora );
        jogarAteOFim( faseRepository.save( primeira ) );

        assertEquals( 2, orquestrador.entradaDe( sucessora ).size(),
                "a fase seguinte recebeu quem não se classificou" );
    }

    @Test
    void semQuantidadeDeClassificadosTodosSeguem ()
    {
        Fase sucessora = novaFase();
        sucessora.setOrdem( 2 );
        faseRepository.save( sucessora );

        Fase primeira = novaFase();
        primeira.setFaseSucessora( sucessora );
        jogarAteOFim( faseRepository.save( primeira ) );

        assertEquals( 4, orquestrador.entradaDe( sucessora ).size() );
    }

    @Test
    void atributoObrigatorioAusenteInvalidaAFase ()
    {
        ResultadoDaValidacao resultado = orquestrador.validar( novaFase() );

        assertFalse( resultado.ehValido() );
        assertTrue( resultado.mensagem().contains( "tamanho do grupo" ) );
    }

    @Test
    void atributoInformadoTornaAFaseValida ()
    {
        Fase fase = novaFase();
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.TAMANHO_DO_GRUPO, "2" );

        assertTrue( orquestrador.validar( fase ).ehValido() );
    }

    @Test
    void valorPadraoVigoraQuandoOAtributoNaoEhInformado ()
    {
        Fase fase = novaFase();
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.TAMANHO_DO_GRUPO, "2" );

        assertFalse( orquestrador.configuracaoDe( fase ).booleano( EstrategiaDeGrupos.IDA_E_VOLTA ) );

        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.IDA_E_VOLTA, "true" );
        assertTrue( orquestrador.configuracaoDe( fase ).booleano( EstrategiaDeGrupos.IDA_E_VOLTA ) );
    }

    @Test
    void atributoDeOutroTipoDeFaseEhRecusado ()
    {
        Fase fase = novaFase();

        assertThrows( IllegalArgumentException.class,
                () -> orquestrador.definirAtributo( fase, "atributoQueNaoExiste", "1" ) );
    }

    @Test
    void validacaoDaPropriaEstrategiaTambemVale ()
    {
        Fase fase = novaFase();

        // 4 equipes em 3 grupos não dividem igualmente, e `permiteGruposDesiguais`
        // está desligado.
        //
        // O teste pedia antes `tamanhoDoGrupo = 3`, contra o dublê, que tratava
        // o atributo como tamanho exato. A estratégia real o trata como pista
        // para derivar a quantidade de grupos — com 4 equipes e tamanho 3 ela
        // forma 2 grupos de 2, que passa na validação. A diferença está
        // registrada em documentos/redesign-do-front.md: pedir grupos de 3 e
        // receber grupos de 2 é surpresa, e é decisão de domínio, não de teste.
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "3" );

        ResultadoDaValidacao resultado = orquestrador.validar( fase );

        assertFalse( resultado.ehValido() );
        assertTrue( resultado.mensagem().contains( "não se dividem" ),
                "a recusa não explicou a divisão: " + resultado.mensagem() );
    }

    @Test
    void configurarFaseInvalidaFalha ()
    {
        Fase fase = novaFase();

        assertThrows( IllegalStateException.class, () -> orquestrador.configurar( fase ) );
    }

    @Test
    void classificacaoEhDerivadaEPortantoEstavel ()
    {
        Fase fase = novaFase();

        assertEquals( orquestrador.classificacaoDe( fase ), orquestrador.classificacaoDe( fase ) );
    }

    /**
     * O contrato promete que `atualizar` é idempotente: chamar duas vezes
     * seguidas não muda nada além do que a primeira chamada mudou.
     *
     * Antes isto era verificado contando chamadas num dublê, o que provava que
     * o orquestrador delegava — não que a delegação fosse idempotente. Contra
     * a estratégia real dá para verificar o que importa: o número de
     * confrontos não muda.
     */
    @Test
    void atualizarAceitaOpcoesEEhIdempotente ()
    {
        Fase fase = novaFase();
        orquestrador.definirAtributo( fase, EstrategiaDeGrupos.TAMANHO_DO_GRUPO, "2" );
        orquestrador.configurar( fase );

        int depoisDeConfigurar = partidaRepository.findByFaseId( fase.getId() ).size();

        orquestrador.atualizar( fase, null );
        orquestrador.atualizar( fase, Map.of( "recalcularJogados", "true" ) );

        assertEquals( depoisDeConfigurar,
                partidaRepository.findByFaseId( fase.getId() ).size(),
                "atualizar gerou confrontos a mais" );
    }

    @Test
    void posicaoAbaixoDeUmViolaARestricaoDeclarada ()
    {
        jakarta.validation.ConstraintViolationException erro =
                assertThrows( jakarta.validation.ConstraintViolationException.class,
                        () -> new Classificado( 0, 1L ) );

        assertTrue( erro.getMessage().contains( "começa em 1" ) );
    }

    @Test
    void classificadoSemTimeViolaARestricaoDeclarada ()
    {
        jakarta.validation.ConstraintViolationException erro =
                assertThrows( jakarta.validation.ConstraintViolationException.class,
                        () -> new Classificado( 1, null ) );

        assertTrue( erro.getMessage().contains( "referenciar uma equipe" ) );
    }

    @Test
    void classificadoValidoEhConstruido ()
    {
        Classificado classificado = new Classificado( 3, 42L );

        assertEquals( 3, classificado.posicao() );
        assertEquals( 42L, classificado.idEquipe() );
    }

    @Test
    void tipoSemEstrategiaRegistradaFalhaComMensagemClara ()
    {
        // Todos os valores do enum já têm estratégia, então o caso de tipo
        // desconhecido é exercitado com a ausência de tipo.
        IllegalArgumentException erro = assertThrows( IllegalArgumentException.class,
                () -> registro.para( null ) );

        assertTrue( erro.getMessage().contains( "não há estratégia registrada" ) );
    }

    @Test
    void osTiposImplementadosEstaoRegistrados ()
    {
        assertTrue( registro.conhece( EnumFasePartida.GRUPOS ) );
        assertTrue( registro.conhece( EnumFasePartida.ELIMINATORIA ) );
    }
}
