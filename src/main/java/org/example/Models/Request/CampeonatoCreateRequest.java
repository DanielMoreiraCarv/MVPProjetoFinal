package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CampeonatoCreateRequest(
        @NotBlank(message = "É preciso informar o nome do campeonato")
        String nome,

        @NotNull(message = "É preciso informar as modalidades")
        @NotEmpty(message = "É preciso informar ao menos uma modalidade para o campeonato")
        List<Long> modalidadesIds,

        @NotNull(message = "É preciso informar se o tipo do campeonato")
        Boolean isMataMata
)
{
}
