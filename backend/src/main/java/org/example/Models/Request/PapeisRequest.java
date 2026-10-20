package org.example.Models.Request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Substitui todos os papéis do usuário pelos da lista. */
public record PapeisRequest(
        @NotNull(message = "É preciso informar a lista de papéis")
        List<@Valid PapelConcedidoRequest> papeis
)
{
}
