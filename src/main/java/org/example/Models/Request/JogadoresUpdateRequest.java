package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;
import org.example.Models.EnumTipoEsporte;
import org.hibernate.validator.constraints.br.CPF;

public record JogadoresUpdateRequest(
        Long id,

        String nome,

        Integer idade,

        Integer numCamisa,

        String cpf,

        EnumTipoEsporte tipoEsporte,

        Integer pontos,

        Integer cestas,

        Integer cartoes,

        Boolean expulso

)
{
}
