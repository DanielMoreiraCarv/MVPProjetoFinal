package org.example.Fases;

import org.example.Models.Campeonato;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.Fase;
import org.example.Models.Modalidade;
import org.example.Models.Partida;
import org.example.Models.Time;
import org.example.Repositories.CampeonatoRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.ModalidadeRepository;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.TimeRepository;
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
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class FaseDeGruposTest
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
    @Autowired private EstrategiaDeGrupos estrategia;
    @Autowired private PartidaRepository partidaRepository;
    @Autowired private FaseRepository faseRepository;
    @Autowired private CampeonatoRepository campeonatoRepository;
    @Autowired private TimeRepository timeRepository;
    @Autowired private ModalidadeRepository modalidadeRepository;

    private Fase faseCom ( int quantidadeDeTimes, Map<String, String> atributos )
    {
        Modalidade modalidade = modalidadeRepository.findByCodigo( "FUTEBOL_DE_CAMPO" )
                .orElseGet( () -> modalidadeRepository.save(
                        new Modalidade( "FUTEBOL_DE_CAMPO", "Futebol de campo", 11 ) ) );

        List<Time> times = new ArrayList<>();
        for ( int i = 1; i <= quantidadeDeTimes; i++ )
        {
            Time time = new Time();
            time.setNome( "Time " + i );
            time.setModalidade( modalidade );
            times.add( timeRepository.save( time ) );
        }

        Campeonato campeonato = new Campeonato();
        campeonato.setNome( "Campeonato de grupos" );
        campeonato.setLstTimes( times );
        campeonato = campeonatoRepository.save( campeonato );

        Fase aCriar = new Fase();
        aCriar.setNome( "Fase de grupos" );
        aCriar.setOrdem( 1 );
        aCriar.setFasePartida( EnumFasePartida.GRUPOS );
        aCriar.setCampeonato( campeonato );
        Fase fase = faseRepository.save( aCriar );

        atributos.forEach( ( codigo, valor ) -> orquestrador.definirAtributo( fase, codigo, valor ) );
        return fase;
    }

    private void encerrar ( Partida partida, int golsMandante, int golsVisitante )
    {
        partida.setResultadoMandante( golsMandante );
        partida.setResultadoVisitante( golsVisitante );
        partida.setRealizada( true );
        partidaRepository.save( partida );
    }

    @Test
    void semNumeroNemTamanhoDeGrupoNaoValida ()
    {
        ResultadoDaValidacao resultado = orquestrador.validar( faseCom( 4, Map.of() ) );

        assertFalse( resultado.ehValido() );
        assertTrue( resultado.mensagem().contains( "exatamente um" ) );
    }

    @Test
    void timesQueNaoDividemIgualmenteSaoRecusados ()
    {
        Fase fase = faseCom( 5, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "2" ) );

        ResultadoDaValidacao resultado = orquestrador.validar( fase );

        assertFalse( resultado.ehValido() );
        assertTrue( resultado.mensagem().contains( "não se dividem igualmente" ) );
    }

    @Test
    void gruposDesiguaisPodemSerHabilitados ()
    {
        Fase fase = faseCom( 5, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "2",
                EstrategiaDeGrupos.GRUPOS_DESIGUAIS, "true" ) );

        assertTrue( orquestrador.validar( fase ).ehValido() );
    }

    @Test
    void doisGruposDeQuatroGeramSeisJogosCadaUm ()
    {
        Fase fase = faseCom( 8, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "2" ) );
        orquestrador.configurar( fase );

        List<Partida> partidas = partidaRepository.findByFaseId( fase.getId() );

        assertEquals( 12, partidas.size() );
        assertEquals( 6, partidas.stream().filter( p -> p.getGrupo() == 1 ).count() );
        assertEquals( 6, partidas.stream().filter( p -> p.getGrupo() == 2 ).count() );
    }

    @Test
    void umGrupoSoEhPontosCorridos ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "1" ) );
        orquestrador.configurar( fase );

        assertEquals( 6, partidaRepository.findByFaseId( fase.getId() ).size() );
    }

    @Test
    void idaEVoltaDobraOsConfrontos ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "1",
                EstrategiaDeGrupos.IDA_E_VOLTA, "true" ) );
        orquestrador.configurar( fase );

        assertEquals( 12, partidaRepository.findByFaseId( fase.getId() ).size() );
    }

    @Test
    void tamanhoDoGrupoEquivaleAoNumeroDeGrupos ()
    {
        Fase fase = faseCom( 8, Map.of( EstrategiaDeGrupos.TAMANHO_DO_GRUPO, "4" ) );
        orquestrador.configurar( fase );

        List<Partida> partidas = partidaRepository.findByFaseId( fase.getId() );

        assertEquals( 12, partidas.size() );
        assertEquals( 2, partidas.stream().map( Partida::getGrupo ).distinct().count() );
    }

    @Test
    void atualizarEhIdempotente ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "1" ) );
        orquestrador.configurar( fase );

        int depoisDeConfigurar = partidaRepository.findByFaseId( fase.getId() ).size();
        orquestrador.atualizar( fase, null );
        orquestrador.atualizar( fase, null );

        assertEquals( depoisDeConfigurar, partidaRepository.findByFaseId( fase.getId() ).size() );
    }

    @Test
    void timeSemJogoRealizadoApareceZeradoNaClassificacao ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "1" ) );
        orquestrador.configurar( fase );

        assertEquals( 4, orquestrador.classificacaoDe( fase ).size() );
    }

    @Test
    void classificacaoOrdenaPorPontosEDepoisPelosCriterios ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "1" ) );
        orquestrador.configurar( fase );

        List<Partida> partidas = partidaRepository.findByFaseId( fase.getId() );
        Long vencedorGeral = partidas.get( 0 ).getIdTimeMandante();

        // O mandante da primeira partida vence as suas; as demais ficam 0 a 0.
        for ( Partida partida : partidas )
        {
            if ( vencedorGeral.equals( partida.getIdTimeMandante() ) )
            {
                encerrar( partida, 3, 0 );
            }
            else if ( vencedorGeral.equals( partida.getIdTimeVisitante() ) )
            {
                encerrar( partida, 0, 3 );
            }
            else
            {
                encerrar( partida, 0, 0 );
            }
        }

        List<Classificado> classificacao = orquestrador.classificacaoDe( fase );

        assertEquals( 1, classificacao.get( 0 ).posicao() );
        assertEquals( vencedorGeral, classificacao.get( 0 ).idTime() );
    }

    @Test
    void entreGruposTodosOsPrimeirosVemAntesDosSegundos ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "2" ) );
        orquestrador.configurar( fase );

        List<Partida> partidas = partidaRepository.findByFaseId( fase.getId() );
        assertEquals( 2, partidas.size() );

        List<Long> primeiros = new ArrayList<>();
        for ( Partida partida : partidas )
        {
            encerrar( partida, 2, 0 );
            primeiros.add( partida.getIdTimeMandante() );
        }

        List<Classificado> classificacao = orquestrador.classificacaoDe( fase );

        assertEquals( 4, classificacao.size() );
        assertTrue( primeiros.contains( classificacao.get( 0 ).idTime() ) );
        assertTrue( primeiros.contains( classificacao.get( 1 ).idTime() ) );
        assertFalse( primeiros.contains( classificacao.get( 2 ).idTime() ) );
        assertFalse( primeiros.contains( classificacao.get( 3 ).idTime() ) );
    }

    @Test
    void classificacaoEhDerivadaEPortantoEstavel ()
    {
        Fase fase = faseCom( 4, Map.of( EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "1" ) );
        orquestrador.configurar( fase );

        assertEquals( orquestrador.classificacaoDe( fase ), orquestrador.classificacaoDe( fase ) );
    }

    @Test
    void atributosDeGruposSaoDeclarados ()
    {
        List<String> codigos = estrategia.atributosSuportados().stream()
                                         .map( a -> a.getCodigo() ).toList();

        assertTrue( codigos.contains( EstrategiaDeGrupos.NUMERO_DE_GRUPOS ) );
        assertTrue( codigos.contains( EstrategiaDeGrupos.IDA_E_VOLTA ) );
        assertTrue( codigos.contains( EstrategiaDeGrupos.CRITERIOS ) );
    }
}
