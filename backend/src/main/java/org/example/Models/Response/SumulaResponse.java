package org.example.Models.Response;

import java.util.Date;
import java.util.List;

public record SumulaResponse(
        Long id,

        PartidaResponse partida,

        ArbitroResponse arbitro,

        Integer placarMandante,

        Integer placarVisitante,

        List<String> ocorrencias,

        List<String> observacoes,

        Date dataFechamento,

        Boolean assinada
)
{
}
