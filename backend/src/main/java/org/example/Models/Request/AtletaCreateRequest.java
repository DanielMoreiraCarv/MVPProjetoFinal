package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;

public record AtletaCreateRequest(
        @NotBlank(message = "É preciso informar o nome do Atleta")
        String nome,

        Integer idade,

        Integer numCamisa,

        @CPF
        String cpf,

        Long idModalidade,

        Long idEquipe
)
{
}
