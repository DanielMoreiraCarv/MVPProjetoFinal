package org.example.Models.Response;

public record SancaoAtletaResponse(
        Long idSancaoAtleta,

        Long idSancao,

        Long idAtleta,

        String nomeAtleta,

        Long idPartida,

        String justificativa,

        Integer partidasRestantes
)
{
}
