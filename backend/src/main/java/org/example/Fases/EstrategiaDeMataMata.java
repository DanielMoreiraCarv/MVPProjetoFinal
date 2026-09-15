package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.EnumTipoDeDado;
import org.example.Models.Fase;
import org.example.Models.Partida;
import org.example.Models.Time;
import org.example.Repositories.PartidaRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Eliminatória. Diferente de grupos, os confrontos das rodadas seguintes só
 * existem quando os vencedores da anterior são conhecidos — por isso atualizar()
 * materializa uma rodada por vez, e precisa poder ser chamado quantas vezes for.
 */
@Component
public class EstrategiaDeMataMata implements EstrategiaDeFase
{
    public static final String PARAR_EM_N_TIMES = "pararEmNTimes";
    public static final String IDA_E_VOLTA = "idaEVolta";
    public static final String DESCONSIDERAR_EMPATES = "desconsiderarEmpatesNaEntrada";
    public static final String RECALCULAR_JOGADOS = "recalcularJogados";

    private final PartidaRepository partidaRepository;

    public EstrategiaDeMataMata ( PartidaRepository partidaRepository )
    {
        this.partidaRepository = partidaRepository;
    }

    @Override
    public EnumFasePartida tipo ()
    {
        return EnumFasePartida.ELIMINATORIA;
    }

    @Override
    public List<AtributoFase> atributosSuportados ()
    {
        return List.of(
                new AtributoFase( tipo(), PARAR_EM_N_TIMES, EnumTipoDeDado.INTEIRO, false, "1",
                        "Quantos times restam ao final. 1 é o campeão; 4 encerra num quadrangular." ),
                new AtributoFase( tipo(), IDA_E_VOLTA, EnumTipoDeDado.BOOLEANO, false, "false",
                        "Se cada confronto tem partida de volta" ),
                new AtributoFase( tipo(), DESCONSIDERAR_EMPATES, EnumTipoDeDado.BOOLEANO, false,
                        "false",
                        "Aceita empates na entrada, desempatando pela ordem recebida" ) );
    }

    @Override
    public boolean aceitaEmpateNaClassificacao ()
    {
        // A semeadura 1 contra N exige ordem estrita. Quem quiser relaxar isso
        // liga desconsiderarEmpatesNaEntrada, tratado em validar().
        return false;
    }

    @Override
    public ResultadoDaValidacao validar ( ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        List<String> erros = new ArrayList<>();
        int pararEm = configuracao.inteiroOu( PARAR_EM_N_TIMES, 1 );
        int participantes = entrada.size();

        if ( participantes < 2 )
        {
            erros.add( "um mata-mata precisa de ao menos 2 times, recebeu " + participantes );
        }
        else if ( pararEm < 1 )
        {
            erros.add( PARAR_EM_N_TIMES + " precisa ser ao menos 1" );
        }
        else if ( pararEm >= participantes )
        {
            erros.add( "parar em " + pararEm + " times não elimina ninguém entre os "
                    + participantes + " participantes" );
        }
        else if ( participantes % pararEm != 0 || !ehPotenciaDeDois( participantes / pararEm ) )
        {
            erros.add( participantes + " times não chegam a " + pararEm
                    + " por eliminações sucessivas pela metade" );
        }

        return new ResultadoDaValidacao( erros );
    }

    private boolean ehPotenciaDeDois ( int valor )
    {
        return valor > 0 && ( valor & ( valor - 1 ) ) == 0;
    }

    /**
     * A validação central recusa empates porque aceitaEmpateNaClassificacao é falso.
     * Quando o atributo permite, a ordem recebida resolve o empate.
     */
    private List<Classificado> ordenar ( ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        List<Classificado> ordenada = new ArrayList<>( entrada );
        ordenada.sort( Comparator.comparingInt( Classificado::posicao )
                                 .thenComparing( Classificado::idTime ) );
        return ordenada;
    }

    @Override
    public void configurar ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        partidaRepository.deleteAll( partidaRepository.findByFaseId( fase.getId() ) );

        List<Long> semeados = ordenar( configuracao, entrada ).stream()
                                                              .map( Classificado::idTime )
                                                              .toList();
        gerarRodada( fase, configuracao, semeados, 1 );
    }

    /** Semeadura 1 contra N, 2 contra N-1: os melhores só se cruzam no fim. */
    private void gerarRodada ( Fase fase, ConfiguracaoDaFase configuracao, List<Long> times,
            int rodada )
    {
        boolean idaEVolta = configuracao.booleano( IDA_E_VOLTA );
        List<Partida> novas = new ArrayList<>();

        for ( int i = 0; i < times.size() / 2; i++ )
        {
            Long mandante = times.get( i );
            Long visitante = times.get( times.size() - 1 - i );

            novas.add( confronto( fase, mandante, visitante, rodada ) );

            if ( idaEVolta )
            {
                novas.add( confronto( fase, visitante, mandante, rodada ) );
            }
        }

        partidaRepository.saveAll( novas );
    }

    private Partida confronto ( Fase fase, Long mandante, Long visitante, int rodada )
    {
        Partida partida = new Partida();
        partida.setFase( fase );
        partida.setCampeonato( fase.getCampeonato() );
        partida.setRodada( rodada );
        partida.setEnumFasePartida( tipo() );
        partida.setTimeMandante( referencia( mandante ) );
        partida.setTimeVisitante( referencia( visitante ) );
        return partida;
    }

    private Time referencia ( Long idTime )
    {
        Time time = new Time();
        time.setId( idTime );
        return time;
    }

    @Override
    public void atualizar ( Fase fase, ConfiguracaoDaFase configuracao, Map<String, String> opcoes )
    {
        boolean recalcularJogados =
                Boolean.parseBoolean( opcoes.getOrDefault( RECALCULAR_JOGADOS, "false" ) );
        int pararEm = configuracao.inteiroOu( PARAR_EM_N_TIMES, 1 );

        Map<Integer, List<Partida>> porRodada = porRodada( fase );

        for ( Map.Entry<Integer, List<Partida>> rodada : porRodada.entrySet() )
        {
            List<Partida> partidas = rodada.getValue();

            if ( partidas.stream().anyMatch( p -> !p.isRealizada() ) )
            {
                // Rodada em aberto: nada a propagar a partir dela.
                continue;
            }

            List<Long> vencedores = vencedoresDe( partidas );

            if ( vencedores.size() <= pararEm )
            {
                continue;
            }

            int proxima = rodada.getKey() + 1;
            List<Partida> jaExistem = porRodada.getOrDefault( proxima, List.of() );

            if ( jaExistem.isEmpty() )
            {
                gerarRodada( fase, configuracao, vencedores, proxima );
                continue;
            }

            // A rodada seguinte já existe. Só é refeita se os participantes
            // mudaram — e, ainda assim, sem destruir partida já realizada,
            // salvo pedido explícito.
            if ( mesmosParticipantes( jaExistem, vencedores ) )
            {
                continue;
            }

            boolean algumaJogada = jaExistem.stream().anyMatch( Partida::isRealizada );

            if ( algumaJogada && !recalcularJogados )
            {
                throw new IllegalStateException( "a rodada " + proxima
                        + " mudou de participantes mas já tem partida realizada; informe "
                        + RECALCULAR_JOGADOS + "=true para refazê-la" );
            }

            partidaRepository.deleteAll( jaExistem );
            gerarRodada( fase, configuracao, vencedores, proxima );
        }
    }

    private boolean mesmosParticipantes ( List<Partida> partidas, List<Long> esperados )
    {
        Set<Long> presentes = new LinkedHashSet<>();
        for ( Partida partida : partidas )
        {
            if ( partida.getIdTimeMandante() != null ) presentes.add( partida.getIdTimeMandante() );
            if ( partida.getIdTimeVisitante() != null ) presentes.add( partida.getIdTimeVisitante() );
        }
        return presentes.equals( new LinkedHashSet<>( esperados ) );
    }

    private Map<Integer, List<Partida>> porRodada ( Fase fase )
    {
        Map<Integer, List<Partida>> porRodada = new LinkedHashMap<>();

        partidaRepository.findByFaseId( fase.getId() ).stream()
                         .sorted( Comparator.comparing( p -> p.getRodada() == null ? 1 : p.getRodada() ) )
                         .forEach( partida -> porRodada
                                 .computeIfAbsent( partida.getRodada() == null ? 1 : partida.getRodada(),
                                         r -> new ArrayList<>() )
                                 .add( partida ) );

        return porRodada;
    }

    /**
     * Com ida e volta, o confronto é decidido pelo agregado. Empate no agregado
     * mantém quem foi semeado como mandante da ida, que é o critério mais
     * simples enquanto não há prorrogação nem pênaltis no modelo.
     */
    private List<Long> vencedoresDe ( List<Partida> partidas )
    {
        Map<String, int[]> agregado = new LinkedHashMap<>();
        Map<String, Long> mandanteDaIda = new LinkedHashMap<>();

        for ( Partida partida : partidas )
        {
            Long a = partida.getIdTimeMandante();
            Long b = partida.getIdTimeVisitante();

            if ( a == null || b == null )
            {
                continue;
            }

            String chave = a < b ? a + "x" + b : b + "x" + a;
            mandanteDaIda.putIfAbsent( chave, a );

            int[] gols = agregado.computeIfAbsent( chave, c -> new int[2] );
            boolean primeiroEhA = mandanteDaIda.get( chave ).equals( a );

            gols[primeiroEhA ? 0 : 1] += partida.getResultadoMandante();
            gols[primeiroEhA ? 1 : 0] += partida.getResultadoVisitante();
        }

        List<Long> vencedores = new ArrayList<>();

        for ( Map.Entry<String, int[]> confronto : agregado.entrySet() )
        {
            String[] lados = confronto.getKey().split( "x" );
            Long primeiro = mandanteDaIda.get( confronto.getKey() );
            Long segundo = primeiro.equals( Long.valueOf( lados[0] ) ) ? Long.valueOf( lados[1] )
                    : Long.valueOf( lados[0] );

            int[] gols = confronto.getValue();
            vencedores.add( gols[1] > gols[0] ? segundo : primeiro );
        }

        return vencedores;
    }

    @Override
    public List<Classificado> classificacao ( Fase fase, ConfiguracaoDaFase configuracao )
    {
        Map<Integer, List<Partida>> porRodada = porRodada( fase );

        if ( porRodada.isEmpty() )
        {
            return List.of();
        }

        // Quem foi eliminado mais tarde fica à frente. Eliminados na mesma
        // rodada empatam, que é o que a posição repetida representa.
        List<List<Long>> faixas = new ArrayList<>();
        List<Integer> rodadas = new ArrayList<>( porRodada.keySet() );

        for ( int i = rodadas.size() - 1; i >= 0; i-- )
        {
            List<Partida> partidas = porRodada.get( rodadas.get( i ) );

            if ( partidas.stream().anyMatch( p -> !p.isRealizada() ) )
            {
                continue;
            }

            List<Long> vencedores = vencedoresDe( partidas );
            List<Long> eliminados = participantesDe( partidas );
            eliminados.removeAll( vencedores );

            if ( faixas.isEmpty() )
            {
                faixas.add( vencedores );
            }
            faixas.add( eliminados );
        }

        // Quem ainda está em jogo entra antes dos eliminados de qualquer rodada.
        List<Long> emJogo = new ArrayList<>();
        for ( List<Partida> partidas : porRodada.values() )
        {
            if ( partidas.stream().anyMatch( p -> !p.isRealizada() ) )
            {
                emJogo.addAll( participantesDe( partidas ) );
            }
        }
        if ( !emJogo.isEmpty() )
        {
            faixas.add( 0, emJogo );
        }

        List<Classificado> ordem = new ArrayList<>();
        int posicao = 1;

        for ( List<Long> faixa : faixas )
        {
            for ( Long idTime : faixa )
            {
                ordem.add( new Classificado( posicao, idTime ) );
            }
            posicao += faixa.size();
        }

        return ordem;
    }

    private List<Long> participantesDe ( List<Partida> partidas )
    {
        Set<Long> times = new LinkedHashSet<>();
        for ( Partida partida : partidas )
        {
            if ( partida.getIdTimeMandante() != null ) times.add( partida.getIdTimeMandante() );
            if ( partida.getIdTimeVisitante() != null ) times.add( partida.getIdTimeVisitante() );
        }
        return new ArrayList<>( times );
    }
}
