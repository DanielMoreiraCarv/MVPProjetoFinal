package org.example.Models.Response;

/** Uma linha da tabela de pontos, com os números que a explicam. */
public record LinhaDaTabelaResponse(
        /** Nulo na tabela única: pontos corridos, ou grupos ainda não sorteados. */
        Integer grupo,
        int posicao,
        Long idEquipe,
        String nomeEquipe,
        int pontos,
        int jogos,
        int vitorias,
        int empates,
        int derrotas,
        int golsPro,
        int golsContra,
        int saldo
)
{
}
