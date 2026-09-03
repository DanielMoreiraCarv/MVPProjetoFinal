package org.example.Models.Response;

import java.util.List;

public record TabelaResponse(
        Long id,

        CampeonatoResponse campeonatoResponse,

        List<PartidaResponse> partidas
)
{
}
