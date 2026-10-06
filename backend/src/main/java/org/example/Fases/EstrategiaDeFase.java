package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.Fase;

import java.util.List;
import java.util.Map;

/**
 * O que todo tipo de fase sabe fazer. A entrada e a saída são a mesma coisa —
 * uma classificação — e é isso que permite encadear fases de tipos diferentes
 * sem que uma conheça a outra.
 *
 * Quem recebe decide quantos aproveita: uma fase que precisa de 10 equipes usa
 * os 10 primeiros da lista que veio.
 */
public interface EstrategiaDeFase
{
    EnumFasePartida tipo ();

    /**
     * Atributos que este tipo aceita. São gravados na tabela de atributos no
     * arranque, e é contra esta lista que a configuração de uma instância é
     * validada.
     */
    List<AtributoFase> atributosSuportados ();

    /**
     * Se a semeadura tolera posições repetidas na classificação que a fase
     * recebe como entrada.
     */
    default boolean aceitaEmpateNaClassificacao ()
    {
        return false;
    }

    /**
     * O mesmo, já com a configuração da fase: a eliminatória tolera empate
     * quando a fase pede para desempatar pela ordem recebida. O orquestrador
     * consulta esta, e não a de cima — consultar a de cima deixava o atributo
     * sem efeito.
     */
    default boolean aceitaEmpateNaEntrada ( ConfiguracaoDaFase configuracao )
    {
        return aceitaEmpateNaClassificacao();
    }

    /** Confere se a configuração e a entrada permitem montar a fase. */
    ResultadoDaValidacao validar ( ConfiguracaoDaFase configuracao, List<Classificado> entrada );

    /** Monta a fase a partir da entrada: distribui as equipes e gera as partidas. */
    void configurar ( Fase fase, ConfiguracaoDaFase configuracao, List<Classificado> entrada );

    /**
     * Recalcula o estado a partir das partidas já registradas: atualiza a
     * classificação interna e materializa os confrontos que passaram a ser
     * conhecidos.
     *
     * Precisa ser idempotente — chamar duas vezes seguidas não pode mudar
     * nada além do que a primeira chamada já mudou.
     *
     * As opções são específicas de cada tipo. Sem opções, o comportamento
     * padrão recalcula apenas o que ainda não foi jogado.
     */
    void atualizar ( Fase fase, ConfiguracaoDaFase configuracao, Map<String, String> opcoes );

    /**
     * Ordem final dos participantes, do primeiro ao último. Posições repetidas
     * representam empate. Devolve todos, sem cortar: o corte é decisão de quem
     * recebe.
     */
    List<Classificado> classificacao ( Fase fase, ConfiguracaoDaFase configuracao );

    /** Se a fase se decide por pontos — grupos e pontos corridos —, e não por eliminação. */
    default boolean temTabelaDePontos ()
    {
        return false;
    }

    /**
     * A tabela de pontos com quem entra na fase, inclusive quem ainda não
     * jogou: zerado desde o início, e não ausente até o primeiro jogo.
     */
    default List<LinhaDaTabela> tabela ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        return List.of();
    }
}
