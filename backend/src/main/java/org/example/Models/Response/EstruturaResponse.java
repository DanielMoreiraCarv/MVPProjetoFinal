package org.example.Models.Response;

import java.util.List;

/** A estrutura da competição validada fase a fase, antes de gerar as partidas. */
public record EstruturaResponse(
        boolean pronta,
        boolean partidasGeradas,
        List<Fase> fases
)
{
    public record Fase(
            Long idFase,
            String nome,
            Integer ordem,
            String fasePartida,
            Integer quantosEntram,
            Integer quantosAvancam,
            boolean valida,
            List<String> erros,
            int partidas
    )
    {
    }
}
