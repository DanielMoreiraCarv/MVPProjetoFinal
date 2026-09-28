package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;

public record FederacaoCreateRequest(
        @NotBlank(message = "É preciso informar o nome da federação")
        String nome
)
{
}
