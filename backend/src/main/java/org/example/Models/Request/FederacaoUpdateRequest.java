package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;

public record FederacaoUpdateRequest(
        Long id,

        @NotBlank(message = "É preciso informar o nome da federação")
        String nome
)
{
}
