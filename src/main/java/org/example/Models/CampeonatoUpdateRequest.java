package org.example.Models;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CampeonatoUpdateRequest(
        @NotNull(message = "É preciso informar o id")
        Long id,

        String nome,

        List<EnumTipoEsporte> esportes,

        List<Long> timesIds,

        boolean mataMata
)
{
}
