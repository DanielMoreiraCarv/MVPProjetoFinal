package org.example.Models.Request;

public record SancaoJogadorRequest(
        Long idSancao,

        Boolean exceao,

        Integer qtdPartidasExcerssao,

        Long idJogador,

        Long idPartida,

        String justificativa
)
{
}
