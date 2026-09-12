package org.example.Models.Request;

import org.example.Models.EnumFasePartida;

public record FaseCreateRequest(
        String nome,

        Integer ordem,

        String fasePartida,

        Long idCampeonato,

        Integer qtdClassificados
)
{
}
