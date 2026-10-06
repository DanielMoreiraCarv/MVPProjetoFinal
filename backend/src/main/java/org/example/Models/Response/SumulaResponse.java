package org.example.Models.Response;

import java.util.Date;
import java.util.List;

public record SumulaResponse(
        Long id,

        PartidaResponse partida,

        ArbitroResponse arbitro,

        Integer placarMandante,

        Integer placarVisitante,

        /**
         * Texto livre, e é esse o limite conhecido: sem a entidade `Evento`
         * não dá para derivar artilharia, contagem de cartão nem suspensão
         * daqui (RF73, RF76, RF105).
         */
        List<String> ocorrencias,

        /** Era uma lista de um elemento só, o que obrigava o cliente a
         *  desembrulhar um texto. */
        String observacoes,

        Date dataFechamento,

        Boolean assinada,

        String modo,

        List<EventoDaSumulaResponse> eventos
)
{
}
