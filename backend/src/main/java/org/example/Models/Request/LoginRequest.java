package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "É preciso informar o e-mail")
        String email,

        @NotBlank(message = "É preciso informar a senha")
        String senha
)
{
}
