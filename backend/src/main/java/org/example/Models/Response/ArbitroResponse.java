package org.example.Models.Response;

public record ArbitroResponse(
        Long id,
        String nome,
        String federacao,
        Integer partidasAptadas
)
{
}
