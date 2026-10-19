package org.example.Fases;

import java.util.List;

/** Uma rodada da eliminatória: oitavas, quartas, semifinal, final. */
public record EtapaDaChave( int rodada, String nome, int equipes, List<ConfrontoDaChave> confrontos )
{
}
