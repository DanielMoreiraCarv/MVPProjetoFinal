package org.example.Models.Response;

import java.time.OffsetDateTime;

/**
 * O que o login e a renovação devolvem (padrao-api.md §5).
 *
 * `token` vai no cabeçalho `Authorization: Bearer …` de cada requisição e
 * vence em `expiraEm`. `tokenRenovacao` só serve para pedir outro par em
 * `/api/v1/auth/renovar`, e é de uso único.
 */
public record AutenticacaoResponse(
        String token,

        String tipo,

        OffsetDateTime expiraEm,

        String tokenRenovacao,

        UsuarioResponse usuario
)
{
}
