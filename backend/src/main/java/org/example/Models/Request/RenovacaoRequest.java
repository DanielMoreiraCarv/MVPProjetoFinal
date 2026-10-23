package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;

/** Serve para renovar a sessão e para encerrá-la. */
public record RenovacaoRequest(
        @NotBlank(message = "É preciso informar o token de renovação")
        String tokenRenovacao
)
{
}
