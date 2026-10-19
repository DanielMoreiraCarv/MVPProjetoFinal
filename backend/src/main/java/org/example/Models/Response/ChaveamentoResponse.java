package org.example.Models.Response;

import java.util.List;

/** A chave da eliminatória, etapa por etapa, na ordem de desenho. */
public record ChaveamentoResponse(
        int participantes,
        int pararEm,
        List<Etapa> etapas
)
{
    public record Etapa( int rodada, String nome, int equipes, List<Confronto> confrontos )
    {
    }

    /**
     * O placar é o agregado do confronto, do ponto de vista de quem é mandante
     * na ida: com ida e volta, o cliente não precisa somar as duas partidas.
     */
    public record Confronto(
            int jogo,
            Integer alimenta,
            Lado mandante,
            Lado visitante,
            Integer placarMandante,
            Integer placarVisitante,
            boolean decidido,
            Long idVencedor,
            List<Long> idsDasPartidas
    )
    {
    }

    /** Um lado do confronto: a equipe, ou de onde ela vai sair. */
    public record Lado( Long idEquipe, String nomeEquipe, String origem )
    {
    }
}
