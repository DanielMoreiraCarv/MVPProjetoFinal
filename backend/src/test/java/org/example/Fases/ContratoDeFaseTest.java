package org.example.Fases;

import org.example.Models.Campeonato;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.Fase;
import org.example.Models.Modalidade;
import org.example.Models.Time;
import org.example.Repositories.AtributoFaseRepository;
import org.example.Repositories.CampeonatoRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.ModalidadeRepository;
import org.example.Repositories.TimeRepository;
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
    @Autowired private EstrategiaFalsa estrategia;
    @Autowired private AtributoFaseRepository atributoRepository;
    @Autowired private FaseRepository faseRepository;
    @Autowired private CampeonatoRepository campeonatoRepository;
    @Autowired private TimeRepository timeRepository;
    @Autowired private ModalidadeRepository modalidadeRepository;

    private Campeonato campeonato;

    @BeforeEach
    void prepararCampeonatoComQuatroTimes ()
    {
        Modalidade modalidade = modalidadeRepository.findByCodigo( "FUTEBOL_DE_CAMPO" )
                                                    .orElseGet( () -> modalidadeRepository
                                                            .save( new Modalidade( "FUTEBOL_DE_CAMPO",
                                                                    "Futebol de campo", 11 ) ) );

        List<Time> times = new ArrayList<>();
        for ( int i = 1; i <= 4; i++ )
        {
            Time time = new Time();
            time.setNome( "Time de teste " + i );
            time.setModalidade( modalidade );
            times.add( timeRepository.save( time ) );
        }

        campeonato = new Campeonato();
        campeonato.setNome( "Campeonato de teste do contrato" );
        campeonato.setLstTimes( times );
        campeonato = campeonatoRepository.save( campeonato );
    }

    private Fase novaFase ()
    {
        Fase fase = new Fase();
        fase.setNome( "Fase de teste" );
        fase.setOrdem( 1 );
        fase.setFasePartida( EnumFasePartida.PONTOS_CORRIDOS );
        fase.setCampeonato( campeonato );
        return faseRepository.save( fase );
    }

    @Test
    void estrategiaEhResolvidaPeloTipoEstatico ()
    {
        assertTrue( registro.conhece( EnumFasePartida.PONTOS_CORRIDOS ) );
        assertEquals( EnumFasePartida.PONTOS_CORRIDOS,
                registro.para( EnumFasePartida.PONTOS_CORRIDOS ).tipo() );
    }

    @Test
    void atributosDeclaradosPelaEstrategiaChegamNaTabela ()
    {
        List<String> codigos = atributoRepository
                .findByTipoFase( EnumFasePartida.PONTOS_CORRIDOS ).stream()
                .map( a -> a.getCodigo() ).toList();

        assertTrue( codigos.contains( EstrategiaFalsa.TAMANHO ) );
        assertTrue( codigos.contains( EstrategiaFalsa.IDA_E_VOLTA ) );
    }

    @Test
    void entradaDaPrimeiraFaseSaoOsTimesInscritosTodosEmpatados ()
    {
        List<Classificado> entrada = orquestrador.entradaDe( novaFase() );

        assertEquals( 4, entrada.size() );
        assertTrue( entrada.stream().allMatch( c -> c.posicao() == 1 ) );
    }

    @Test
    void atributoObrigatorioAusenteInvalidaAFase ()
    {
        ResultadoDaValidacao resultado = orquestrador.validar( novaFase() );

        assertFalse( resultado.ehValido() );
        assertTrue( resultado.mensagem().contains( EstrategiaFalsa.TAMANHO ) );
    }

    @Test
    void atributoInformadoTornaAFaseValida ()
    {
        Fase fase = novaFase();
        orquestrador.definirAtributo( fase, EstrategiaFalsa.TAMANHO, "2" );

        assertTrue( orquestrador.validar( fase ).ehValido() );
    }

    @Test
    void valorPadraoVigoraQuandoOAtributoNaoEhInformado ()
    {
        Fase fase = novaFase();
        orquestrador.definirAtributo( fase, EstrategiaFalsa.TAMANHO, "2" );

        assertFalse( orquestrador.configuracaoDe( fase ).booleano( EstrategiaFalsa.IDA_E_VOLTA ) );

        orquestrador.definirAtributo( fase, EstrategiaFalsa.IDA_E_VOLTA, "true" );
        assertTrue( orquestrador.configuracaoDe( fase ).booleano( EstrategiaFalsa.IDA_E_VOLTA ) );
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
        // 4 times não se dividem em grupos de 3
        orquestrador.definirAtributo( fase, EstrategiaFalsa.TAMANHO, "3" );

        ResultadoDaValidacao resultado = orquestrador.validar( fase );

        assertFalse( resultado.ehValido() );
        assertTrue( resultado.mensagem().contains( "não se dividem" ) );
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

    @Test
    void atualizarAceitaOpcoesEPodeSerChamadoMaisDeUmaVez ()
    {
        Fase fase = novaFase();
        estrategia.chamadasDeAtualizar.clear();

        orquestrador.atualizar( fase, null );
        orquestrador.atualizar( fase, Map.of( "recalcularJogados", "true" ) );

        assertEquals( List.of( "atualizar:0", "atualizar:1" ), estrategia.chamadasDeAtualizar );
    }

    @Test
    void tipoSemEstrategiaRegistradaFalhaComMensagemClara ()
    {
        IllegalArgumentException erro = assertThrows( IllegalArgumentException.class,
                () -> registro.para( EnumFasePartida.ELIMINATORIA ) );

        assertTrue( erro.getMessage().contains( "ELIMINATORIA" ) );
    }
}
