package org.example.Models.Response;

import java.util.List;

public record CampeonatoResponse(
        Long id,

        String nome,

        List<ModalidadeResponse> modalidades,

        List<TimeResponse> lstTimes,

        Boolean isMataMata
)
{
}
