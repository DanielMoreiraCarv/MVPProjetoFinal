package org.example.Models.Response;

import java.util.List;

public record TabelaResponse(
        Long id,

        CompeticaoResponse competicao,

        List<PartidaResponse> partidas
)
{
}
