package org.example.Models.Response;

import org.example.Models.EnumTipoEsporte;

public record SancaoResponse(
        Long id,

        Integer qtdPartidasPadrao,

        String tipoEsporte,

        Long idCampeonato
)
{
}
