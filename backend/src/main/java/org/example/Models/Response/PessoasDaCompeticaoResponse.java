package org.example.Models.Response;

import java.time.OffsetDateTime;
import java.util.List;

/** Quem participa da competição e os convites ainda sem conta. */
public record PessoasDaCompeticaoResponse(
        List<Participante> participantes,
        List<Convite> convites
)
{
    public record Participante(Long id, String nome, String email, boolean voce)
    {
    }

    public record Convite(Long id, String email, OffsetDateTime criadoEm)
    {
    }
}
