package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;

/** Um papel a conceder. Sem administração, vale para a plataforma inteira. */
public record PapelConcedidoRequest(
        @NotBlank(message = "É preciso informar o código do papel")
        String codigo,

        Long administracaoId
)
{
}
