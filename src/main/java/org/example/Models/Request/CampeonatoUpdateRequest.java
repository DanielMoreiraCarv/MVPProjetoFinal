package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;
import org.example.Models.EnumTipoEsporte;

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
