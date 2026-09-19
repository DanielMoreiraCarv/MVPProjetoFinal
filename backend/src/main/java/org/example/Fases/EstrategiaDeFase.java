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
 * Quem recebe decide quantos aproveita: uma fase que precisa de 10 times usa
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

    /** Confere se a configuração e a entrada permitem montar a fase. */
    ResultadoDaValidacao validar ( ConfiguracaoDaFase configuracao, List<Classificado> entrada );

    /** Monta a fase a partir da entrada: distribui os times e gera as partidas. */
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
}
