package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CPF;

public record JogadoresUpdateRequest(
        Long id,

        String nome,

        Integer idade,

        Integer numCamisa,

        String cpf,

        Long idModalidade,

        Integer pontos,

        Integer cestas,

        Integer cartoes,

        Boolean expulso

)
{
}
