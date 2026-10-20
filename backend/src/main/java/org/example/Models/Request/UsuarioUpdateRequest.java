package org.example.Models.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @NotBlank(message = "É preciso informar o nome")
        @Size(max = 180, message = "O nome pode ter até 180 caracteres")
        String nome,

        @NotBlank(message = "É preciso informar o e-mail")
        @Email(message = "O e-mail informado não é válido")
        @Size(max = 180, message = "O e-mail pode ter até 180 caracteres")
        String email,

        @NotNull(message = "É preciso informar se o usuário está ativo")
        Boolean ativo
)
{
}
