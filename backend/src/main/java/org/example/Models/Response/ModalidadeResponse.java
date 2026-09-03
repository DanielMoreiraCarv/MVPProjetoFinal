package org.example.Models.Response;

public record ModalidadeResponse(
        Long id,

        String codigo,

        String nome,

        int jogadoresEmQuadra
)
{
}
