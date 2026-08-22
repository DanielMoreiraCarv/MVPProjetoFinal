package org.example.Models.Response;

import org.example.Models.EnumTipoEsporte;

import java.util.List;

public record TimeResponse(
        Long id,

        String nome,

        FederacaoResponse federacaoResponse,

        List<JogadoresResponse> jogadores,

        EnumTipoEsporte enumTipoEsporte

)
{
}
