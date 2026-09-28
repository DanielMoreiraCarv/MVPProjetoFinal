package org.example.Models.Response;

import org.example.Models.EnumFasePartida;

import java.time.OffsetDateTime;

public record PartidaResponse(
        Long id,

        EquipeResumoResponse equipeMandante,

        EquipeResumoResponse equipeVisitante,

        String nomeCompeticao,

        Long idCompeticao,

        String vencedor,

        Boolean realizada,

        EnumFasePartida fase,

        ArbitroResponse arbitro,

        // Números, não "2 x 1": o cliente estava partindo uma string ao meio
        // para recuperar dois inteiros que o servidor já tinha.
        Integer placarMandante,

        Integer placarVisitante,

        /** ISO-8601 com fuso. Nulo enquanto a partida não foi agendada. */
        OffsetDateTime dataHora,

        String local
)
{
}
