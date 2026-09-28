package org.example.Models.Response;

import org.example.Models.EnumFasePartida;

public record PartidaResponse(
        Long id,

        EquipeResponse equipeMandante,

        EquipeResponse equipeVisitante,

        String nomeCompeticao,

        Long idCompeticao,

        String vencedor,

        Boolean realizada,

        EnumFasePartida fase,

        ArbitroResponse arbitro,

        String resultado
)
{
}
