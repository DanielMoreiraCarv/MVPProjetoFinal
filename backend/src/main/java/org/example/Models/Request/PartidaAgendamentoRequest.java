package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

/** Marcar dia, hora e lugar — o pedido mais comum do calendário (RF58). */
public record PartidaAgendamentoRequest(
        @NotNull(message = "É preciso informar a data e a hora")
        OffsetDateTime dataHora,

        String local
)
{
}
