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
import java.util.List;
import java.util.Map;

/**
 * Todos contra todos dentro de cada grupo. Com um grupo só, é pontos corridos.
 *
 * Todos os confrontos são conhecidos desde a configuração, então atualizar()
 * só precisa garantir que eles existam — a classificação é derivada das
 * partidas a cada leitura.
 */
@Component
public class EstrategiaDeGrupos implements EstrategiaDeFase
{
    public static final String NUMERO_DE_GRUPOS = "numeroDeGrupos";
    public static final String TAMANHO_DO_GRUPO = "tamanhoDoGrupo";
    public static final String IDA_E_VOLTA = "idaEVolta";
    public static final String GRUPOS_DESIGUAIS = "permiteGruposDesiguais";
    public static final String CRITERIOS = "criteriosDeDesempate";
    public static final String PONTOS_VITORIA = "pontosPorVitoria";
    public static final String PONTOS_EMPATE = "pontosPorEmpate";
    public static final String PONTOS_DERROTA = "pontosPorDerrota";

    private final PartidaRepository partidaRepository;

    public EstrategiaDeGrupos ( PartidaRepository partidaRepository )
    {
        this.partidaRepository = partidaRepository;
    }

    @Override
    public EnumFasePartida tipo ()
    {
        return EnumFasePartida.GRUPOS;
    }

    @Override
    public List<AtributoFase> atributosSuportados ()
    {
        return List.of(
                new AtributoFase( tipo(), NUMERO_DE_GRUPOS, EnumTipoDeDado.INTEIRO, false, null,
                        "Quantos grupos formar. Informe este ou o tamanho do grupo." ),
                new AtributoFase( tipo(), TAMANHO_DO_GRUPO, EnumTipoDeDado.INTEIRO, false, null,
                        "Quantas equipes por grupo. Informe este ou o número de grupos." ),
                new AtributoFase( tipo(), IDA_E_VOLTA, EnumTipoDeDado.BOOLEANO, false, "false",
                        "Se cada confronto tem partida de volta" ),
                new AtributoFase( tipo(), GRUPOS_DESIGUAIS, EnumTipoDeDado.BOOLEANO, false, "false",
                        "Se os grupos podem ter tamanhos diferentes" ),
                new AtributoFase( tipo(), CRITERIOS, EnumTipoDeDado.LISTA_DE_TEXTO, false,
                        "SALDO_GOLS,GOLS_PRO,VITORIAS",
                        "Critérios de desempate, na ordem, aplicados depois dos pontos" ),
                new AtributoFase( tipo(), PONTOS_VITORIA, EnumTipoDeDado.INTEIRO, false, "3",
                        "Pontos por vitória" ),
                new AtributoFase( tipo(), PONTOS_EMPATE, EnumTipoDeDado.INTEIRO, false, "1",
                        "Pontos por empate" ),
                new AtributoFase( tipo(), PONTOS_DERROTA, EnumTipoDeDado.INTEIRO, false, "0",
                        "Pontos por derrota" ) );
    }

    /** As equipes só precisam ser distribuídos nos grupos; a ordem exata não importa. */
    @Override
    public boolean aceitaEmpateNaClassificacao ()
    {
        return true;
    }

    @Override
    public ResultadoDaValidacao validar ( ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        List<String> erros = new ArrayList<>();
        boolean temNumero = configuracao.informado( NUMERO_DE_GRUPOS );
        boolean temTamanho = configuracao.informado( TAMANHO_DO_GRUPO );

        if ( temNumero == temTamanho )
        {
            erros.add( temNumero
                    ? "Informe o número de grupos ou o tamanho do grupo, não os dois."
                    : "Informe o número de grupos ou o tamanho do grupo." );
        }

        if ( entrada.size() < 2 )
        {
            erros.add( "Uma fase de grupos precisa de ao menos 2 equipes; entram " + entrada.size() + "." );
        }

        if ( erros.isEmpty() )
        {
            int quantidade = numeroDeGrupos( configuracao, entrada.size() );

            if ( quantidade < 1 )
            {
                erros.add( "O número de grupos precisa ser ao menos 1." );
            }
            else if ( quantidade > entrada.size() )
            {
                erros.add( "Há mais grupos (" + quantidade + ") do que equipes (" + entrada.size() + ")." );
            }
            else if ( entrada.size() % quantidade != 0 && !configuracao.booleano( GRUPOS_DESIGUAIS ) )
            {
                erros.add( "As " + entrada.size() + " equipes não se dividem igualmente em "
                        + quantidade + " grupos. Ajuste o número de grupos ou permita grupos de tamanhos diferentes." );
            }
        }

        return new ResultadoDaValidacao( erros );
    }

    private int numeroDeGrupos ( ConfiguracaoDaFase configuracao, int totalDeTimes )
    {
        if ( configuracao.informado( NUMERO_DE_GRUPOS ) )
        {
            return configuracao.inteiroOu( NUMERO_DE_GRUPOS, 1 );
        }

        int tamanho = configuracao.inteiroOu( TAMANHO_DO_GRUPO, totalDeTimes );
        return Math.max( 1, (int) Math.ceil( totalDeTimes / (double) tamanho ) );
    }

    /**
     * Distribuição em serpentina: com a entrada ordenada, os melhores ficam em
     * grupos diferentes em vez de se concentrarem no primeiro.
     */
    private Map<Integer, List<Long>> distribuir ( List<Classificado> entrada, int quantidade )
    {
        Map<Integer, List<Long>> grupos = new LinkedHashMap<>();
        for ( int indice = 1; indice <= quantidade; indice++ )
        {
            grupos.put( indice, new ArrayList<>() );
        }

        List<Classificado> ordenada = new ArrayList<>( entrada );
        ordenada.sort( Comparator.comparingInt( Classificado::posicao )
                                 .thenComparing( Classificado::idEquipe ) );

        for ( int i = 0; i < ordenada.size(); i++ )
        {
            int volta = i / quantidade;
            int passo = i % quantidade;
            int indice = volta % 2 == 0 ? passo + 1 : quantidade - passo;
            grupos.get( indice ).add( ordenada.get( i ).idEquipe() );
        }

        return grupos;
    }

    @Override
    public void configurar ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        partidaRepository.deleteAll( partidaRepository.findByFaseId( fase.getId() ) );
        gerarPartidasFaltantes( fase, configuracao, entrada );
    }

    @Override
    public void atualizar ( Fase fase, ConfiguracaoDaFase configuracao, Map<String, String> opcoes )
    {
        // Em grupos todos os confrontos já nascem na configuração e a
        // classificação é derivada, então aqui só resta repor o que faltar.
        // Chamar de novo sem mudanças não gera nada: é o que torna idempotente.
        gerarPartidasFaltantes( fase, configuracao, entradaDasPartidas( fase ) );
    }

    private List<Classificado> entradaDasPartidas ( Fase fase )
    {
        List<Classificado> equipes = new ArrayList<>();
        for ( Partida partida : partidaRepository.findByFaseId( fase.getId() ) )
        {
            adicionarSeNovo( equipes, partida.getIdEquipeMandante() );
            adicionarSeNovo( equipes, partida.getIdEquipeVisitante() );
        }
        return equipes;
    }

    private void adicionarSeNovo ( List<Classificado> equipes, Long idEquipe )
    {
        if ( idEquipe != null && equipes.stream().noneMatch( c -> c.idEquipe().equals( idEquipe ) ) )
        {
            equipes.add( new Classificado( 1, idEquipe ) );
        }
    }

    private void gerarPartidasFaltantes ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        if ( entrada.isEmpty() )
        {
            return;
        }

        Map<Integer, List<Long>> grupos = distribuir( entrada, numeroDeGrupos( configuracao, entrada.size() ) );
        List<Partida> existentes = partidaRepository.findByFaseId( fase.getId() );
        boolean idaEVolta = configuracao.booleano( IDA_E_VOLTA );
        List<Partida> novas = new ArrayList<>();

        for ( Map.Entry<Integer, List<Long>> grupo : grupos.entrySet() )
        {
            List<Long> equipes = grupo.getValue();

            for ( int i = 0; i < equipes.size(); i++ )
            {
                for ( int j = i + 1; j < equipes.size(); j++ )
                {
                    adicionarSeAusente( novas, existentes, fase, grupo.getKey(), equipes.get( i ),
                            equipes.get( j ), 1 );

                    if ( idaEVolta )
                    {
                        adicionarSeAusente( novas, existentes, fase, grupo.getKey(), equipes.get( j ),
                                equipes.get( i ), 2 );
                    }
                }
            }
        }

        partidaRepository.saveAll( novas );
    }

    private void adicionarSeAusente ( List<Partida> novas, List<Partida> existentes, Fase fase,
            int grupo, Long mandante, Long visitante, int rodada )
    {
        boolean jaExiste = existentes.stream()
                                     .anyMatch( p -> mandante.equals( p.getIdEquipeMandante() )
                                             && visitante.equals( p.getIdEquipeVisitante() )
                                             && Integer.valueOf( rodada ).equals( p.getRodada() ) );

        if ( jaExiste )
        {
            return;
        }

        Partida partida = new Partida();
        partida.setFase( fase );
        partida.setCompeticao( fase.getCompeticao() );
        partida.setGrupo( grupo );
        partida.setRodada( rodada );
        partida.setEnumFasePartida( tipo() );
        partida.setEquipeMandante( referencia( mandante ) );
        partida.setEquipeVisitante( referencia( visitante ) );
        novas.add( partida );
    }

    private Equipe referencia ( Long idEquipe )
    {
        Equipe equipe = new Equipe();
        equipe.setId( idEquipe );
        return equipe;
    }

    @Override
    public List<Classificado> classificacao ( Fase fase, ConfiguracaoDaFase configuracao )
    {
        Map<Integer, List<Desempenho>> porGrupo = desempenhoPorGrupo( fase, configuracao );
        Comparator<Desempenho> comparador = CriterioDeDesempate.comparadorDe( configuracao.lista( CRITERIOS ) );

        // Ordena dentro de cada grupo; depois junta todos os primeiros, todos
        // os segundos, e assim por diante, aplicando os mesmos critérios entre
        // colocados de mesma posição.
        int maiorGrupo = 0;
        for ( List<Desempenho> grupo : porGrupo.values() )
        {
            grupo.sort( comparador );
            maiorGrupo = Math.max( maiorGrupo, grupo.size() );
        }

        List<Classificado> ordem = new ArrayList<>();
        int posicao = 1;

        for ( int colocacao = 0; colocacao < maiorGrupo; colocacao++ )
        {
            List<Desempenho> mesmaColocacao = new ArrayList<>();

            for ( List<Desempenho> grupo : porGrupo.values() )
            {
                if ( colocacao < grupo.size() )
                {
                    mesmaColocacao.add( grupo.get( colocacao ) );
                }
            }

            mesmaColocacao.sort( comparador );

            for ( Desempenho desempenho : mesmaColocacao )
            {
                ordem.add( new Classificado( posicao++, desempenho.getIdTime() ) );
            }
        }

        return ordem;
    }

    @Override
    public boolean temTabelaDePontos ()
    {
        return true;
    }

    @Override
    public List<LinhaDaTabela> tabela ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        Map<Integer, List<Desempenho>> porGrupo = desempenhoPorGrupo( fase, configuracao );
        Comparator<Desempenho> comparador = CriterioDeDesempate.comparadorDe( configuracao.lista( CRITERIOS ) );

        // Sem confrontos gerados ainda não há grupo: a tabela é única, com
        // quem vai entrar na fase, todos zerados.
        if ( porGrupo.isEmpty() )
        {
            List<LinhaDaTabela> unica = new ArrayList<>();
            for ( Classificado classificado : entrada )
            {
                unica.add( new LinhaDaTabela( null, unica.size() + 1, new Desempenho( classificado.idEquipe() ) ) );
            }
            return unica;
        }

        boolean variosGrupos = porGrupo.size() > 1;
        List<LinhaDaTabela> linhas = new ArrayList<>();
        porGrupo.forEach( ( grupo, equipes ) -> {
            equipes.sort( comparador );
            for ( int i = 0; i < equipes.size(); i++ )
            {
                linhas.add( new LinhaDaTabela( variosGrupos ? grupo : null, i + 1, equipes.get( i ) ) );
            }
        } );
        return linhas;
    }

    private Map<Integer, List<Desempenho>> desempenhoPorGrupo ( Fase fase,
            ConfiguracaoDaFase configuracao )
    {
        int porVitoria = configuracao.inteiroOu( PONTOS_VITORIA, 3 );
        int porEmpate = configuracao.inteiroOu( PONTOS_EMPATE, 1 );
        int porDerrota = configuracao.inteiroOu( PONTOS_DERROTA, 0 );

        Map<Integer, Map<Long, Desempenho>> porGrupo = new LinkedHashMap<>();

        for ( Partida partida : partidaRepository.findByFaseId( fase.getId() ) )
        {
            int grupo = partida.getGrupo() == null ? 1 : partida.getGrupo();
            Map<Long, Desempenho> doGrupo = porGrupo.computeIfAbsent( grupo, g -> new LinkedHashMap<>() );

            Long mandante = partida.getIdEquipeMandante();
            Long visitante = partida.getIdEquipeVisitante();

            if ( mandante == null || visitante == null )
            {
                continue;
            }

            Desempenho deMandante = doGrupo.computeIfAbsent( mandante, Desempenho::new );
            Desempenho deVisitante = doGrupo.computeIfAbsent( visitante, Desempenho::new );

            // Equipe que ainda não jogou aparece na tabela zerado, e não ausente.
            if ( !partida.isRealizada() )
            {
                continue;
            }

            deMandante.registrar( partida.getPlacarMandante(), partida.getPlacarVisitante(),
                    porVitoria, porEmpate, porDerrota );
            deVisitante.registrar( partida.getPlacarVisitante(), partida.getPlacarMandante(),
                    porVitoria, porEmpate, porDerrota );
        }

        Map<Integer, List<Desempenho>> resultado = new LinkedHashMap<>();
        porGrupo.forEach( ( grupo, equipes ) -> resultado.put( grupo, new ArrayList<>( equipes.values() ) ) );
        return resultado;
    }
}
