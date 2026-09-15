package org.example.Models;

/**
 * Uma posição na classificação de uma fase. É ao mesmo tempo a saída de uma
 * fase e a entrada da seguinte, o que permite encadeá-las sem que uma conheça
 * o tipo da outra.
 *
 * Posições iguais representam empate. Cabe à fase que recebe decidir se aceita.
 */
public record Classificado(int posicao, Long idTime)
{
    public Classificado
    {
        if ( posicao < 1 )
        {
            throw new IllegalArgumentException( "posição deve começar em 1" );
        }
        if ( idTime == null )
        {
            throw new IllegalArgumentException( "classificado sem time" );
        }
    }
}
