package org.example.Models.Request;

/** Campo ausente é campo que não muda. */
public record SumulaUpdateRequest(
        Long idArbitro,

        Integer placarMandante,

        Integer placarVisitante,

        String observacoes,

        /** SIMPLIFICADA ou COMPLETA. */
        String modo
)
{
}
