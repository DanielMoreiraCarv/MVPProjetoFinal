package org.example.Models.Response;

import java.time.OffsetDateTime;

public record EventoDaSumulaResponse(
        Long id,

        Long idAtleta,

        String nomeAtleta,

        Integer numCamisa,

        Long idEquipe,

        String tipo,

        /** Gerado pelo sistema — o vermelho do segundo amarelo. */
        boolean automatico,

        /** Quando entrou na súmula, não o minuto de jogo. */
        OffsetDateTime registradoEm
)
{
}
