package org.example.Models.Response;

import java.util.Date;
import java.util.List;

public record SumulaResponse(
        Long id,

        PartidaResponse partidaResponse,

        ArbitroResponse arbitro,

        Integer pontosMandante,

        Integer pontosVisitante,

        List<String> lstOcorrencias,

        List<String> lstObservacoes,

        Date dataFechamento,

        Boolean assinada
)
{
}
