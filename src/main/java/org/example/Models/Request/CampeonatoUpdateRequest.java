package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CampeonatoUpdateRequest(
        @NotNull(message = "É preciso informar o id")
        Long id,

        String nome,

        List<Long> modalidadesIds,

        List<Long> timesIds,

        boolean mataMata
)
{
}
