package org.example.Seguranca;

/**
 * Quem fez a requisição, como o filtro de JWT o deixa no contexto de
 * segurança. Os controllers recebem por `@AuthenticationPrincipal`.
 */
public record UsuarioAutenticado(
        Long id,

        String email
)
{
}
