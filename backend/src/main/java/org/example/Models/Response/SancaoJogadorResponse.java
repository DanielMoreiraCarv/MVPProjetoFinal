package org.example.Models.Response;

public record SancaoJogadorResponse(
        Long idSancaoJogador,

        Long idSancao,

        Long idJogador,

        String nomeJogador,

        Long idPartida,

        String justificativa,

        Integer PartidasRestantes
)
{
}
