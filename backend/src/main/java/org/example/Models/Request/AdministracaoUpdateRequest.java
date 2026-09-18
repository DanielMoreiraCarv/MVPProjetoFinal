package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdministracaoUpdateRequest(
        @NotNull(message = "É preciso informar o id")
        Long id,

        @NotBlank(message = "É preciso informar o nome da administração")
        String nome,

        String descricao
)
{
}
