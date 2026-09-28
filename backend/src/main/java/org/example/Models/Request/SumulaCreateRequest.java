package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;

/**
 * A rota aceitava a entidade `Sumula` como corpo, com a `Partida` aninhada —
 * e `Partida` referencia a súmula de volta.
 */
public record SumulaCreateRequest(
        @NotNull(message = "É preciso informar a partida")
        Long idPartida,

        Long idArbitro
)
{
}
