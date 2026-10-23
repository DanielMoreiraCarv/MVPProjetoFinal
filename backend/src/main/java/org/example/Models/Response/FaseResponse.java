package org.example.Models.Response;

public record FaseResponse(
        Long id,
        String nome,
        Integer ordem,
        String fasePartida,
        Integer qtdClassificados,
        Long idFaseSucessora,

        /** Quantas equipes entram: as inscritas, ou as que avançam da anterior. */
        Integer quantosEntram,

        /** Quantas avançam: o total da fase, ou o que o formato diz por padrão. */
        Integer quantosAvancam
)
{
}
