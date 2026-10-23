package org.example.Fases;

import org.example.Models.Competicao;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.Fase;
import org.example.Models.Modalidade;
import org.example.Models.Partida;
import org.example.Models.Equipe;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.ModalidadeRepository;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.EquipeRepository;
import org.junit.jupiter.api.BeforeAll;
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
class FaseDeMataMataTest
{
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
    @Autowired private org.example.Services.PartidaService partidaService;
    @Autowired private PartidaRepository partidaRepository;
    @Autowired private FaseRepository faseRepository;
    @Autowired private CompeticaoRepository competicaoRepository;
    @Autowired private EquipeRepository timeRepository;
    @Autowired private ModalidadeRepository modalidadeRepository;

    private List<Equipe> equipes = new ArrayList<>();

    private Fase faseCom ( int quantidadeDeTimes, Map<String, String> atributos )
    {
        Modalidade modalidade = modalidadeRepository.findByCodigo( "FUTEBOL_DE_CAMPO" )
                .orElseGet( () -> modalidadeRepository.save(
                        new Modalidade( "FUTEBOL_DE_CAMPO", "Futebol de campo", 11 ) ) );

        equipes = new ArrayList<>();
        for ( int i = 1; i <= quantidadeDeTimes; i++ )
        {
            Equipe equipe = new Equipe();
            equipe.setNome( "Equipe " + i );
            equipe.setModalidade( modalidade );
            equipes.add( timeRepository.save( equipe ) );
        }

        Competicao competicao = new Competicao();
        competicao.setNome( "Competicao eliminatório" );
        competicao.setLstEquipes( equipes );
        competicao = competicaoRepository.save( competicao );

        Fase aCriar = new Fase();
        aCriar.setNome( "Mata-mata" );
        aCriar.setOrdem( 1 );
        aCriar.setFasePartida( EnumFasePartida.ELIMINATORIA );
        aCriar.setCompeticao( competicao );
        Fase fase = faseRepository.save( aCriar );

        atributos.forEach( ( codigo, valor ) -> orquestrador.definirAtributo( fase, codigo, valor ) );
        return fase;
    }

    /** Configura semeando 1..N, já que a primeira fase chega toda empatada. */
    private void configurarSemeado ( Fase fase )
    {
        List<Classificado> entrada = new ArrayList<>();
        for ( int i = 0; i < equipes.size(); i++ )
        {
            entrada.add( new Classificado( i + 1, equipes.get( i ).getId() ) );
        }

        orquestrador.configuracaoDe( fase );
        new EstrategiaDeMataMata( partidaRepository )
                .configurar( fase, orquestrador.configuracaoDe( fase ), entrada );
    }

    private void encerrarRodada ( Fase fase, int rodada, boolean mandanteVence )
    {
        for ( Partida partida : partidaRepository.findByFaseId( fase.getId() ) )
        {
            if ( Integer.valueOf( rodada ).equals( partida.getRodada() ) && !partida.isRealizada() )
            {
                partida.setPlacarMandante( mandanteVence ? 2 : 0 );
                partida.setPlacarVisitante( mandanteVence ? 0 : 2 );
                partida.setRealizada( true );
                partidaRepository.save( partida );
            }
        }
    }

    private List<Partida> daRodada ( Fase fase, int rodada )
    {
        return partidaRepository.findByFaseId( fase.getId() ).stream()
                                .filter( p -> Integer.valueOf( rodada ).equals( p.getRodada() ) )
                                .toList();
    }

    /**
     * Pelo orquestrador, e não semeando à mão: os outros testes contornam o
     * empate da primeira fase, e por isso nenhum percebeu que o atributo que
     * o resolve não tinha efeito.
     */
    @Test
    void primeiraFaseDesempatadaPelaOrdemGeraOsConfrontos ()
    {
        Fase fase = faseCom( 8, Map.of( EstrategiaDeMataMata.DESCONSIDERAR_EMPATES, "true" ) );

        assertTrue( orquestrador.validar( fase ).ehValido(), orquestrador.validar( fase ).mensagem() );
        orquestrador.configurar( fase );
        assertEquals( 4, daRodada( fase, 1 ).size() );
    }

    @Test
    void primeiraFaseSemDesempateDizComoResolver ()
    {
        ResultadoDaValidacao resultado = orquestrador.validar( faseCom( 8, Map.of() ) );

        assertFalse( resultado.ehValido() );
        assertTrue( resultado.mensagem().contains( "Aceitar empates na entrada" ), resultado.mensagem() );
    }

    @Test
    void chaveamentoDesenhaAChaveInteiraDesdeOInicio ()
    {
        Fase fase = faseCom( 8, Map.of( EstrategiaDeMataMata.DESCONSIDERAR_EMPATES, "true" ) );
        orquestrador.configurar( fase );

        Chaveamento chave = orquestrador.chaveamentoDe( fase );

        assertEquals( 8, chave.participantes() );
        assertEquals( List.of( "Quartas de final", "Semifinal", "Final" ),
                chave.etapas().stream().map( EtapaDaChave::nome ).toList() );
        // Na ordem de desenho, cada par vizinho alimenta o mesmo jogo da etapa seguinte.
        List<ConfrontoDaChave> quartas = chave.etapas().get( 0 ).confrontos();
        assertEquals( 4, quartas.size() );
        assertEquals( quartas.get( 0 ).alimenta(), quartas.get( 1 ).alimenta() );
        assertEquals( quartas.get( 2 ).alimenta(), quartas.get( 3 ).alimenta() );
        // A semifinal ainda não existe, mas a chave já diz de onde vem cada lado.
        ConfrontoDaChave semi = chave.etapas().get( 1 ).confrontos().get( 0 );
        assertEquals( null, semi.idMandante() );
        assertTrue( semi.origemMandante().startsWith( "Vencedor do jogo" ) );
    }

    @Test
    void encerrarORestoDaRodadaGeraAProximaSozinho ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeMataMata.DESCONSIDERAR_EMPATES, "true" ) );
        orquestrador.configurar( fase );

        for ( Partida partida : daRodada( fase, 1 ) )
        {
            partidaService.definirResultado( partida.getId(), 1, 0 );
        }

        assertEquals( 1, daRodada( fase, 2 ).size(),
                "a final só aparecia se alguém chamasse a rota de atualizar a fase" );
        ConfrontoDaChave finalDaChave = orquestrador.chaveamentoDe( fase ).etapas().get( 1 ).confrontos().get( 0 );
        assertTrue( finalDaChave.idMandante() != null && finalDaChave.idVisitante() != null );
    }

    @Test
    void oitoTimesGeramQuatroConfrontosNaPrimeiraRodada ()
    {
        Fase fase = faseCom( 8, Map.of() );
        configurarSemeado( fase );

        assertEquals( 4, daRodada( fase, 1 ).size() );
    }

    @Test
    void semeaduraCruzaOPrimeiroComOUltimo ()
    {
        Fase fase = faseCom( 4, Map.of() );
        configurarSemeado( fase );

        List<Partida> primeira = daRodada( fase, 1 );

        assertTrue( primeira.stream().anyMatch(
                p -> p.getIdEquipeMandante().equals( equipes.get( 0 ).getId() )
                        && p.getIdEquipeVisitante().equals( equipes.get( 3 ).getId() ) ) );
    }

    @Test
    void quantidadeQueNaoReduzPelaMetadeEhRecusada ()
    {
        Fase fase = faseCom( 6, Map.of() );

        ResultadoDaValidacao resultado = orquestrador.validar( fase );

        assertFalse( resultado.ehValido() );
    }

    @Test
    void pararEmQuatroEncerraNoQuadrangular ()
    {
        Fase fase = faseCom( 8, Map.of( EstrategiaDeMataMata.PARAR_EM_N_TIMES, "4" ) );
        configurarSemeado( fase );

        encerrarRodada( fase, 1, true );
        orquestrador.atualizar( fase, null );

        // Com 8 equipes parando em 4, uma rodada basta: ninguém mais é eliminado.
        assertEquals( 0, daRodada( fase, 2 ).size() );
        assertEquals( 4, orquestrador.classificacaoDe( fase ).stream()
                                     .filter( c -> c.posicao() == 1 ).count() );
    }

    @Test
    void pararEmQuatroComDezesseisTimesGeraDuasRodadas ()
    {
        Fase fase = faseCom( 16, Map.of( EstrategiaDeMataMata.PARAR_EM_N_TIMES, "4" ) );
        configurarSemeado( fase );

        assertEquals( 8, daRodada( fase, 1 ).size() );

        encerrarRodada( fase, 1, true );
        orquestrador.atualizar( fase, null );

        assertEquals( 4, daRodada( fase, 2 ).size() );

        encerrarRodada( fase, 2, true );
        orquestrador.atualizar( fase, null );

        assertEquals( 0, daRodada( fase, 3 ).size() );
    }

    @Test
    void chaveAvancaAteOCampeao ()
    {
        Fase fase = faseCom( 4, Map.of() );
        configurarSemeado( fase );

        encerrarRodada( fase, 1, true );
        orquestrador.atualizar( fase, null );

        assertEquals( 1, daRodada( fase, 2 ).size() );

        encerrarRodada( fase, 2, true );
        orquestrador.atualizar( fase, null );

        List<Classificado> classificacao = orquestrador.classificacaoDe( fase );

        assertEquals( 1, classificacao.get( 0 ).posicao() );
        assertEquals( 1, classificacao.stream().filter( c -> c.posicao() == 1 ).count() );
    }

    @Test
    void atualizarEhIdempotente ()
    {
        Fase fase = faseCom( 8, Map.of() );
        configurarSemeado( fase );
        encerrarRodada( fase, 1, true );

        orquestrador.atualizar( fase, null );
        int depoisDaPrimeira = partidaRepository.findByFaseId( fase.getId() ).size();

        orquestrador.atualizar( fase, null );
        orquestrador.atualizar( fase, null );

        assertEquals( depoisDaPrimeira, partidaRepository.findByFaseId( fase.getId() ).size() );
    }

    @Test
    void rodadaEmAbertoNaoPropaga ()
    {
        Fase fase = faseCom( 8, Map.of() );
        configurarSemeado( fase );

        orquestrador.atualizar( fase, null );

        assertEquals( 0, daRodada( fase, 2 ).size() );
    }

    @Test
    void eliminadosNaMesmaRodadaEmpatamNaClassificacao ()
    {
        Fase fase = faseCom( 4, Map.of() );
        configurarSemeado( fase );

        encerrarRodada( fase, 1, true );
        orquestrador.atualizar( fase, null );
        encerrarRodada( fase, 2, true );

        List<Classificado> classificacao = orquestrador.classificacaoDe( fase );

        assertEquals( 4, classificacao.size() );
        // campeão, vice, e os dois eliminados na primeira rodada empatados em 3º
        assertEquals( 2, classificacao.stream().filter( c -> c.posicao() == 3 ).count() );
    }

    @Test
    void resultadoCorrigidoRefazARodadaSeguinteNaoJogada ()
    {
        Fase fase = faseCom( 4, Map.of() );
        configurarSemeado( fase );

        encerrarRodada( fase, 1, true );
        orquestrador.atualizar( fase, null );

        List<Long> antes = daRodada( fase, 2 ).stream().map( Partida::getIdEquipeMandante ).toList();

        // Inverte o resultado da primeira partida da primeira rodada.
        Partida corrigida = daRodada( fase, 1 ).get( 0 );
        corrigida.setPlacarMandante( 0 );
        corrigida.setPlacarVisitante( 2 );
        partidaRepository.save( corrigida );

        orquestrador.atualizar( fase, null );

        List<Long> depois = daRodada( fase, 2 ).stream().map( Partida::getIdEquipeMandante ).toList();

        assertEquals( 1, daRodada( fase, 2 ).size() );
        assertFalse( antes.equals( depois ) && antes.contains( corrigida.getIdEquipeMandante() ) );
    }

    @Test
    void correcaoComRodadaSeguinteJaJogadaExigePedidoExplicito ()
    {
        Fase fase = faseCom( 4, Map.of() );
        configurarSemeado( fase );

        encerrarRodada( fase, 1, true );
        orquestrador.atualizar( fase, null );
        encerrarRodada( fase, 2, true );

        Partida corrigida = daRodada( fase, 1 ).get( 0 );
        corrigida.setPlacarMandante( 0 );
        corrigida.setPlacarVisitante( 2 );
        partidaRepository.save( corrigida );

        assertThrows( IllegalStateException.class, () -> orquestrador.atualizar( fase, null ) );

        orquestrador.atualizar( fase,
                Map.of( EstrategiaDeMataMata.RECALCULAR_JOGADOS, "true" ) );

        assertEquals( 1, daRodada( fase, 2 ).size() );
    }

    @Test
    void idaEVoltaDobraOsConfrontosDaRodada ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeMataMata.IDA_E_VOLTA, "true" ) );
        configurarSemeado( fase );

        assertEquals( 4, daRodada( fase, 1 ).size() );
    }
}
