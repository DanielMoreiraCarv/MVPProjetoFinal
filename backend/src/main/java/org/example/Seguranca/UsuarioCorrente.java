package org.example.Seguranca;

import org.example.Models.Papel;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/** Quem fez a requisição em curso, para quem não recebe o principal por parâmetro. */
public final class UsuarioCorrente
{
    private static final String PAPEL_DA_PLATAFORMA = "ROLE_" + Papel.ADMINISTRADOR;

    private UsuarioCorrente()
    {
    }

    public static Optional<Long> id()
    {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();
        return autenticacao != null && autenticacao.getPrincipal() instanceof UsuarioAutenticado usuario
                ? Optional.of(usuario.id())
                : Optional.empty();
    }

    /**
     * A administração da plataforma vê e edita tudo — é o suporte. Quem se
     * cadastra é ORGANIZADOR e só enxerga o que é seu ou foi compartilhado.
     */
    public static boolean daPlataforma()
    {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();
        return autenticacao != null && autenticacao.getAuthorities().stream()
                .anyMatch(autoridade -> PAPEL_DA_PLATAFORMA.equals(autoridade.getAuthority()));
    }
}
