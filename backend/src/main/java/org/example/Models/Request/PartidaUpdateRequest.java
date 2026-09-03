package org.example.Models.Request;

public record PartidaUpdateRequest(
        Long id,

        Long idMandante,

        Long idVisitante,

        Long idCampeonato,

        Integer resultadoVisitante,

        Integer resultadoMandante,

        Long idArbitro
)
{
}
