package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SancaoRequest(
        @NotNull(message = "É preciso informar a quantidade de partidas padrão para a sanção")
        Integer qtdPartidas,

        @NotBlank(message = "É preciso informar o esporta da sanção")
        String tipoEsporte,

        @NotNull(message = "É preciso informar o campeonato da sanção")
        Long idCampeonato
)
{
}
