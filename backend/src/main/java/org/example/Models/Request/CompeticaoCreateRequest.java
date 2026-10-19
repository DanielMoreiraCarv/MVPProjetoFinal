package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CompeticaoCreateRequest(
        @NotBlank(message = "É preciso informar o nome da competição")
        String nome,

        @NotNull(message = "É preciso informar as modalidades")
        @NotEmpty(message = "É preciso informar ao menos uma modalidade para a competição")
        List<Long> modalidadesIds,

        @NotNull(message = "É preciso informar se o tipo da competição")
        Boolean isMataMata,

        String descricao,

        String categoria,

        Long idAdministracao
)
{
}
