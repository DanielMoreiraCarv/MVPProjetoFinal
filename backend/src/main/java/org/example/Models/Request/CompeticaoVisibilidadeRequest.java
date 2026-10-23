package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;

public record CompeticaoVisibilidadeRequest(
        @NotNull(message = "É preciso dizer se a competição é pública")
        Boolean publica
)
{
}
