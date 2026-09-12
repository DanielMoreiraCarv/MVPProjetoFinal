package org.example.Models.Request;

import org.example.Models.EnumFasePartida;
import org.example.Models.EnumTipoFase;

public record FaseUpdateRequest(
        Long id,

        String nome,

        Integer ordem,

        EnumFasePartida fasePartida,

        Long idCampeonato,

        Integer qtdClassificados,

        Long idFaseSucessora
)
{
}
