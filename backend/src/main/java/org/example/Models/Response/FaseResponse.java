package org.example.Models.Response;

public record FaseResponse(
        Long id,
        String nome,
        Integer ordem,
        String fasePartida,
        Integer qtdClassificados,
        Long idFaseSucessora
)
{
}
