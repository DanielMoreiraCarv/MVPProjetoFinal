package org.example.Models.Response;

import org.example.Models.EnumFasePartida;

public record PartidaResponse(
        Long id,

        TimeResponse timeMandante,

        TimeResponse timeVisitante,

        String nomeCampeonato,

        Long idCampeonato,

        String vencedor,

        Boolean realizada,

        EnumFasePartida fase,

        ArbitroResponse arbitro,

        String resultado
)
{
}
