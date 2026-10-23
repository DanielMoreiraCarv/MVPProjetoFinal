package org.example.Models.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ConviteRequest(
        @NotBlank(message = "É preciso informar o e-mail")
        @Email(message = "O e-mail não parece válido")
        String email
)
{
}
