package org.example.Models.Request;

import org.example.Models.EnumTipoEsporte;

public record TimeUpdateRequest(
        Long id,

        String nome,

        EnumTipoEsporte enumTipoEsporte,

        Long idFederacao

)
{
}
