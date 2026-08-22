package org.example.Models.Request;

import org.example.Models.EnumTipoEsporte;

public record TimeCreateRequest(
        String nome,

        EnumTipoEsporte enumTipoEsporte,

        Long idFederacao

)
{
}
