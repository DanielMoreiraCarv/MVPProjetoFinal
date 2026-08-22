package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;

public record ArbitroUpdateResquest(
        @NotNull(message = "É preciso informar o ID do árbitro")
        Long id,

        String nome,


        String federacao,


        String categoria,

        Integer partidasApitadas
)
{
}
