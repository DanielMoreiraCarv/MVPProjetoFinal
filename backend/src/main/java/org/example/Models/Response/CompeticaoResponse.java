package org.example.Models.Response;

import java.util.List;

public record CompeticaoResponse(
        Long id,

        String nome,

        List<ModalidadeResponse> modalidades,

        List<EquipeResponse> equipes,

        Boolean isMataMata,

        String descricao,

        String categoria,

        Long idAdministracao
)
{
}
