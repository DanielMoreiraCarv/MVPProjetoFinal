package org.example.Fases;

import org.example.Models.Partida;

import java.util.List;

/**
 * Um confronto da chave. `jogo` é o número dele na etapa, e `alimenta` o
 * número do confronto da etapa seguinte que recebe o vencedor. Com ida e
 * volta, as duas partidas vêm juntas.
 */
public record ConfrontoDaChave(
        int jogo,
        Integer alimenta,
        Long idMandante,
        Long idVisitante,
        String origemMandante,
        String origemVisitante,
        List<Partida> partidas,
        Long idVencedor )
{
}
