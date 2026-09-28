package org.example.Models.Request;

public record AtletaUpdateRequest(
        Long id,
        String nome,
        Integer idade,
        Integer numCamisa,
        String cpf,
        Long idModalidade,
        Integer pontos,
        Integer cestas,
        Integer cartoes,
        Boolean expulso
)
{
}
