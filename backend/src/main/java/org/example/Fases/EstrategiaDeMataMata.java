package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.EnumTipoDeDado;
import org.example.Models.Fase;
import org.example.Models.Partida;
import org.example.Models.Equipe;
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
                        "Quantas equipes restam ao final. 1 é o campeão; 4 encerra num quadrangular." ),
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
    public Integer quantosAvancamPorPadrao ( ConfiguracaoDaFase configuracao, int entram )
    {
        return configuracao.inteiroOu( PARAR_EM_N_TIMES, 1 );
    }

    @Override
    public boolean aceitaEmpateNaEntrada ( ConfiguracaoDaFase configuracao )
    {
        return configuracao.booleano( DESCONSIDERAR_EMPATES );
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
            erros.add( "Uma eliminatória precisa de ao menos 2 equipes; entram " + participantes + "." );
        }
        else if ( pararEm < 1 )
        {
            erros.add( "As equipes ao final precisam ser ao menos 1." );
        }
        else if ( pararEm >= participantes )
        {
            erros.add( "Terminar com " + pararEm + " equipes não elimina ninguém entre as "
                    + participantes + " que entram." );
        }
        else if ( participantes % pararEm != 0 || !ehPotenciaDeDois( participantes / pararEm ) )
        {
            erros.add( participantes + " equipes não chegam a " + pararEm
                    + " eliminando metade a cada rodada." );
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
                                 .thenComparing( Classificado::idEquipe ) );
        return ordenada;
    }

    @Override
    public void configurar ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        partidaRepository.deleteAll( partidaRepository.findByFaseId( fase.getId() ) );

        List<Long> semeados = ordenar( configuracao, entrada ).stream()
                                                              .map( Classificado::idEquipe )
                                                              .toList();
        gerarRodada( fase, configuracao, semeados, 1 );
    }

    /** Semeadura 1 contra N, 2 contra N-1: os melhores só se cruzam no fim. */
    private void gerarRodada ( Fase fase, ConfiguracaoDaFase configuracao, List<Long> equipes,
            int rodada )
    {
        boolean idaEVolta = configuracao.booleano( IDA_E_VOLTA );
        List<Partida> novas = new ArrayList<>();

        for ( int i = 0; i < equipes.size() / 2; i++ )
        {
            Long mandante = equipes.get( i );
            Long visitante = equipes.get( equipes.size() - 1 - i );

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
        partida.setCompeticao( fase.getCompeticao() );
        partida.setRodada( rodada );
        partida.setEnumFasePartida( tipo() );
        partida.setEquipeMandante( referencia( mandante ) );
        partida.setEquipeVisitante( referencia( visitante ) );
        return partida;
    }

    private Equipe referencia ( Long idEquipe )
    {
        Equipe equipe = new Equipe();
        equipe.setId( idEquipe );
        return equipe;
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
            if ( partida.getIdEquipeMandante() != null ) presentes.add( partida.getIdEquipeMandante() );
            if ( partida.getIdEquipeVisitante() != null ) presentes.add( partida.getIdEquipeVisitante() );
        }
        return presentes.equals( new LinkedHashSet<>( esperados ) );
    }

    /**
     * A chave inteira, das etapas jogadas às que ainda não existem.
     *
     * O motor emparelha os vencedores de uma rodada como emparelha a semeadura
     * — o primeiro contra o último —, então o confronto k da etapa seguinte
     * recebe os vencedores dos jogos k e n−1−k. É essa regra que deixa a chave
     * desenhável antes de a rodada existir.
     */
    public Chaveamento chaveamento ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada, int participantesPrevistos )
    {
        int pararEm = Math.max( 1, configuracao.inteiroOu( PARAR_EM_N_TIMES, 1 ) );
        Map<Integer, List<Partida>> porRodada = porRodada( fase );
        List<List<Partida>> primeira = porRodada.isEmpty()
                ? List.of()
                : confrontosDe( porRodada.values().iterator().next() );
        // Sem confrontos nem entrada — a fase anterior ainda não terminou —,
        // a chave é desenhada vazia, do tamanho que ela vai ter.
        int participantes = !primeira.isEmpty() ? primeira.size() * 2
                : !entrada.isEmpty() ? entrada.size() : participantesPrevistos;

        if ( participantes < 2 || participantes <= pararEm || participantes % pararEm != 0
                || !ehPotenciaDeDois( participantes / pararEm ) )
        {
            return new Chaveamento( participantes, pararEm, List.of() );
        }

        int totalDeEtapas = Integer.numberOfTrailingZeros( participantes / pararEm );
        List<List<ConfrontoDaChave>> etapas = new ArrayList<>();
        int jogos = participantes / 2;

        for ( int etapa = 1; etapa <= totalDeEtapas; etapa++, jogos /= 2 )
        {
            List<List<Partida>> geradas = confrontosDe( porRodada.getOrDefault( etapa, List.of() ) );
            List<ConfrontoDaChave> daEtapa = new ArrayList<>();

            for ( int k = 0; k < jogos; k++ )
            {
                List<Partida> partidas = k < geradas.size() ? geradas.get( k ) : List.of();
                Partida ida = partidas.isEmpty() ? null : partidas.get( 0 );
                boolean decidido = !partidas.isEmpty() && partidas.stream().allMatch( Partida::isRealizada );

                daEtapa.add( new ConfrontoDaChave(
                        k + 1,
                        etapa < totalDeEtapas ? Math.min( k, jogos - 1 - k ) + 1 : null,
                        ida == null ? null : ida.getIdEquipeMandante(),
                        ida == null ? null : ida.getIdEquipeVisitante(),
                        etapa == 1 ? null : "Vencedor do jogo " + ( k + 1 ),
                        etapa == 1 ? null : "Vencedor do jogo " + ( jogos * 2 - k ),
                        partidas,
                        decidido ? vencedoresDe( partidas ).get( 0 ) : null ) );
            }
            etapas.add( daEtapa );
        }

        // Ordem de desenho, da última etapa para a primeira: os dois que
        // alimentam um confronto ficam lado a lado na coluna anterior.
        List<List<Integer>> ordem = new ArrayList<>();
        for ( int i = 0; i < totalDeEtapas; i++ )
        {
            ordem.add( null );
        }
        List<Integer> ultima = new ArrayList<>();
        for ( int k = 0; k < etapas.get( totalDeEtapas - 1 ).size(); k++ )
        {
            ultima.add( k );
        }
        ordem.set( totalDeEtapas - 1, ultima );
        for ( int etapa = totalDeEtapas - 1; etapa >= 1; etapa-- )
        {
            int anteriores = etapas.get( etapa - 1 ).size();
            List<Integer> naAnterior = new ArrayList<>();
            for ( int k : ordem.get( etapa ) )
            {
                naAnterior.add( k );
                naAnterior.add( anteriores - 1 - k );
            }
            ordem.set( etapa - 1, naAnterior );
        }

        List<EtapaDaChave> desenhadas = new ArrayList<>();
        for ( int etapa = 0; etapa < totalDeEtapas; etapa++ )
        {
            List<ConfrontoDaChave> daEtapa = etapas.get( etapa );
            int equipes = daEtapa.size() * 2;
            desenhadas.add( new EtapaDaChave( etapa + 1, nomeDaEtapa( equipes ), equipes,
                    ordem.get( etapa ).stream().map( daEtapa::get ).toList() ) );
        }

        return new Chaveamento( participantes, pararEm, desenhadas );
    }

    private static String nomeDaEtapa ( int equipes )
    {
        return switch ( equipes )
        {
            case 2 -> "Final";
            case 4 -> "Semifinal";
            case 8 -> "Quartas de final";
            case 16 -> "Oitavas de final";
            default -> ( equipes / 2 ) + " avos de final";
        };
    }

    /** As partidas da rodada juntadas por confronto: com ida e volta, são duas. */
    private static List<List<Partida>> confrontosDe ( List<Partida> partidas )
    {
        Map<String, List<Partida>> porPar = new LinkedHashMap<>();
        for ( Partida partida : partidas )
        {
            Long a = partida.getIdEquipeMandante();
            Long b = partida.getIdEquipeVisitante();
            String chave = a == null || b == null ? "p" + partida.getId()
                    : ( a < b ? a + "x" + b : b + "x" + a );
            porPar.computeIfAbsent( chave, c -> new ArrayList<>() ).add( partida );
        }
        return new ArrayList<>( porPar.values() );
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
            Long a = partida.getIdEquipeMandante();
            Long b = partida.getIdEquipeVisitante();

            if ( a == null || b == null )
            {
                continue;
            }

            String chave = a < b ? a + "x" + b : b + "x" + a;
            mandanteDaIda.putIfAbsent( chave, a );

            int[] gols = agregado.computeIfAbsent( chave, c -> new int[2] );
            boolean primeiroEhA = mandanteDaIda.get( chave ).equals( a );

            gols[primeiroEhA ? 0 : 1] += partida.getPlacarMandante();
            gols[primeiroEhA ? 1 : 0] += partida.getPlacarVisitante();
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
            for ( Long idEquipe : faixa )
            {
                ordem.add( new Classificado( posicao, idEquipe ) );
            }
            posicao += faixa.size();
        }

        return ordem;
    }

    private List<Long> participantesDe ( List<Partida> partidas )
    {
        Set<Long> equipes = new LinkedHashSet<>();
        for ( Partida partida : partidas )
        {
            if ( partida.getIdEquipeMandante() != null ) equipes.add( partida.getIdEquipeMandante() );
            if ( partida.getIdEquipeVisitante() != null ) equipes.add( partida.getIdEquipeVisitante() );
        }
        return new ArrayList<>( equipes );
    }
}
