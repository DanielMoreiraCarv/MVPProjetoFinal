package org.example.Models.Response;

import java.time.OffsetDateTime;
import java.util.List;

/** O usuário como a API o mostra. O hash da senha fica de fora, sempre. */
public record UsuarioResponse(
        Long id,

        String nome,

        String email,

        boolean ativo,

        OffsetDateTime criadoEm,

        List<PapelConcedidoResponse> papeis
)
{
    public record PapelConcedidoResponse(
            String codigo,

            Long administracaoId,

            String administracaoNome
    )
    {
    }
}
