package org.example.Fases;

import java.util.List;

/**
 * A chave de uma eliminatória, etapa por etapa, já na ordem de desenho: em
 * cada etapa, cada par de confrontos vizinhos alimenta o mesmo confronto da
 * etapa seguinte. As etapas que ainda não foram geradas vêm com os lados
 * vazios e a origem de cada um.
 */
public record Chaveamento( int participantes, int pararEm, List<EtapaDaChave> etapas )
{
}
