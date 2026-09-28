package org.example.Models.Request;

import java.time.OffsetDateTime;

/**
 * Campo ausente é campo que não muda — o corpo diz o que alterar, não o
 * estado inteiro da partida.
 */
public record PartidaUpdateRequest(
        Long idEquipeMandante,

        Long idEquipeVisitante,

        Long idCompeticao,

        Long idArbitro,

        Integer placarMandante,

        Integer placarVisitante,

        OffsetDateTime dataHora,

        String local
)
{
}
