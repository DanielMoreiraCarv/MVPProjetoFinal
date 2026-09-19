package org.example.Fases;

import java.util.Comparator;
import java.util.List;

/**
 * Critérios aplicados em ordem depois dos pontos. A fase os recebe como
 * atributo, então cada competição pode ter os seus.
 */
public enum CriterioDeDesempate
{
    SALDO_GOLS( Comparator.comparingInt( Desempenho::getSaldoDeGols ).reversed() ),
    GOLS_PRO( Comparator.comparingInt( Desempenho::getGolsPro ).reversed() ),
    VITORIAS( Comparator.comparingInt( Desempenho::getVitorias ).reversed() ),
    MENOS_JOGOS( Comparator.comparingInt( Desempenho::getJogos ) );

    private final Comparator<Desempenho> comparador;

    CriterioDeDesempate ( Comparator<Desempenho> comparador )
    {
        this.comparador = comparador;
    }

    public Comparator<Desempenho> comparador ()
    {
        return comparador;
    }

    /** Ignora código desconhecido em vez de derrubar a classificação. */
    public static Comparator<Desempenho> comparadorDe ( List<String> codigos )
    {
        Comparator<Desempenho> comparador =
                Comparator.comparingInt( Desempenho::getPontos ).reversed();

        for ( String codigo : codigos )
        {
            try
            {
                comparador = comparador.thenComparing(
                        valueOf( codigo.trim().toUpperCase() ).comparador() );
            }
            catch ( IllegalArgumentException desconhecido )
            {
                // critério não suportado ainda; os demais continuam valendo
            }
        }

        return comparador;
    }
}
