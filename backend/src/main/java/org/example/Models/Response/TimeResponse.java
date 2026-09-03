package org.example.Models.Response;

import java.util.List;

public record TimeResponse(
        Long id,

        String nome,

        FederacaoResponse federacaoResponse,

        List<JogadoresResponse> jogadores,

        ModalidadeResponse modalidade

)
{
}
