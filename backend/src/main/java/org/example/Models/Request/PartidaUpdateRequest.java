package org.example.Models.Request;

public record PartidaUpdateRequest(
        Long id,

        Long idEquipeMandante,

        Long idEquipeVisitante,

        Long idCompeticao,

        Integer placarMandante,

        Integer placarVisitante,

        Long idArbitro
)
{
}
