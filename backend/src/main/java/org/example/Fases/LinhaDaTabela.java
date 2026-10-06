package org.example.Fases;

/**
 * Uma linha da tabela de pontos: a posição dentro do grupo e o desempenho que
 * a explica. Grupo nulo é tabela única — pontos corridos, ou a fase de grupos
 * antes de os grupos serem sorteados.
 */
public record LinhaDaTabela( Integer grupo, int posicao, Desempenho desempenho )
{
}
