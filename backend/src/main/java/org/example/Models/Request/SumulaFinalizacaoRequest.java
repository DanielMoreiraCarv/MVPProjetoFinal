package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/** Encerra a súmula com o placar final e o relato. */
public record SumulaFinalizacaoRequest(
        @NotNull(message = "É preciso informar o placar do mandante")
        @PositiveOrZero(message = "O placar não pode ser negativo")
        Integer placarMandante,

        @NotNull(message = "É preciso informar o placar do visitante")
        @PositiveOrZero(message = "O placar não pode ser negativo")
        Integer placarVisitante,

        String observacoes
)
{
}
