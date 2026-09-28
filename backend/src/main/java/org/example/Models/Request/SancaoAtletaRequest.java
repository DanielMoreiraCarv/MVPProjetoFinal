package org.example.Models.Request;

public record SancaoAtletaRequest(
        Long idSancao,

        Boolean exceao,

        Integer qtdPartidasExcerssao,

        Long idAtleta,

        Long idPartida,

        String justificativa
)
{
}
