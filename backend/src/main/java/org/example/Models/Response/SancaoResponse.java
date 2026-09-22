package org.example.Models.Response;

public record SancaoResponse(
        Long id,

        Integer qtdPartidasPadrao,

        String tipoEsporte,

        Long idCampeonato
)
{
}
