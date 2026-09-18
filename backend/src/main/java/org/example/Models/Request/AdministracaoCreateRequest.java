package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;

public record AdministracaoCreateRequest(
        @NotBlank(message = "É preciso informar o nome da administração")
        String nome,

        String descricao
)
{
}
