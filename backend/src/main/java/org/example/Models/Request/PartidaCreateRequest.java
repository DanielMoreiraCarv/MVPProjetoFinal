package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

/**
 * A rota de criar partida aceitava a entidade JPA como corpo, com `Equipe`,
 * `Competicao`, `Fase` e `Arbitro` aninhados. Na prática o cliente não
 * conseguia montar esse corpo, e se conseguisse ficaria preso ao mapeamento.
 */
public record PartidaCreateRequest(
        @NotNull(message = "É preciso informar a competição")
        Long idCompeticao,

        @NotNull(message = "É preciso informar a equipe mandante")
        Long idEquipeMandante,

        @NotNull(message = "É preciso informar a equipe visitante")
        Long idEquipeVisitante,

        Long idFase,

        Long idArbitro,

        /** ISO-8601 com fuso, por exemplo "2026-02-07T09:00:00-03:00". */
        OffsetDateTime dataHora,

        String local
)
{
}
