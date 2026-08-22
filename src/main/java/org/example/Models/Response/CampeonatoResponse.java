package org.example.Models.Response;

import java.util.List;

public record CampeonatoResponse(
        Long id,

        String nome,

        List<String> lstTipoEsporte,

        List<TimeResponse> lstTimes,

        Boolean isMataMata
)
{
}
