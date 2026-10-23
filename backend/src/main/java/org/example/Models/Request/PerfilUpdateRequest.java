package org.example.Models.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** O próprio usuário editando nome e e-mail. */
public record PerfilUpdateRequest(
        @NotBlank(message = "É preciso informar o nome")
        @Size(max = 180, message = "O nome pode ter até 180 caracteres")
        String nome,

        @NotBlank(message = "É preciso informar o e-mail")
        @Email(message = "O e-mail informado não é válido")
        @Size(max = 180, message = "O e-mail pode ter até 180 caracteres")
        String email
)
{
}
