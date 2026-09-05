package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;

public record JogadoresCreateRequest(
        @NotBlank(message = "É preciso informar o nome do Jogador")
        String nome,

        Integer idade,

        Integer numCamisa,

        @CPF
        String cpf,

        Long idModalidade,

        Long idTime
)
{
}
