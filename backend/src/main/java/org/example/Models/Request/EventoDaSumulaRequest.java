package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EventoDaSumulaRequest(
        @NotNull(message = "É preciso informar o atleta")
        Long idAtleta,

        @NotBlank(message = "É preciso informar o que aconteceu")
        String tipo
)
{
}
