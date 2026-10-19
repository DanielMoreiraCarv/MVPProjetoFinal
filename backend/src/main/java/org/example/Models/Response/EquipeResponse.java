package org.example.Models.Response;

import java.util.List;

public record EquipeResponse(
        Long id,

        String nome,

        FederacaoResponse federacao,

        List<AtletaResponse> atletas,

        ModalidadeResponse modalidade

)
{
}
