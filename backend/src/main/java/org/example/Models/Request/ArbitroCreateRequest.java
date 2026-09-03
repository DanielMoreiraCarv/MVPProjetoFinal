package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;

public record ArbitroCreateRequest(
        @NotNull(message = "É preciso informar o nome do árbitro")
        String nome,

        @NotNull(message = "É preciso informar a federação do árbitro")
        String federacao,

        @NotNull(message = "É preciso informar a categoria do árbitro")
        String categoria
)
{
}
