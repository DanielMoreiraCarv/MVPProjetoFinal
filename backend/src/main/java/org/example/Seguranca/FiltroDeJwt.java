package org.example.Seguranca;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.Models.Usuario;
import org.example.Repositories.UsuarioRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

/**
 * Lê o `Authorization: Bearer …` e, se o token valer, põe o usuário no
 * contexto de segurança.
 *
 * Token ausente ou inválido não é recusado aqui: a requisição segue anônima, e
 * quem decide se a rota aceita anônimo é a configuração de segurança. Assim um
 * token velho guardado no navegador não quebra as rotas públicas.
 *
 * O usuário é relido do banco a cada requisição. Custa uma consulta, e é o que
 * faz desativar um usuário ou trocar a senha valer na hora, sem esperar o
 * token vencer.
 *
 * Não é `@Component` de propósito: o Spring Boot registraria qualquer `Filter`
 * gerenciado também na cadeia do servlet, e ele rodaria duas vezes. Quem o
 * instancia é a configuração de segurança.
 */
public class FiltroDeJwt extends OncePerRequestFilter
{
    private static final String PREFIXO = "Bearer ";

    private final ServicoDeJwt servicoDeJwt;
    private final UsuarioRepository usuarioRepository;

    public FiltroDeJwt(ServicoDeJwt servicoDeJwt, UsuarioRepository usuarioRepository)
    {
        this.servicoDeJwt = servicoDeJwt;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest requisicao, HttpServletResponse resposta, FilterChain cadeia)
            throws ServletException, IOException
    {
        String cabecalho = requisicao.getHeader(HttpHeaders.AUTHORIZATION);

        if (cabecalho != null && cabecalho.startsWith(PREFIXO))
        {
            servicoDeJwt.conferir(cabecalho.substring(PREFIXO.length()).trim())
                    .flatMap(this::usuarioValido)
                    .ifPresent(this::autenticar);
        }

        cadeia.doFilter(requisicao, resposta);
    }

    private Optional<Usuario> usuarioValido(Claims claims)
    {
        Long id;
        try
        {
            id = Long.valueOf(claims.getSubject());
        }
        catch (NumberFormatException malformado)
        {
            return Optional.empty();
        }

        // O `iat` do JWT tem precisão de segundo; a troca de senha, não. Sem o
        // truncamento o token emitido no mesmo segundo da troca seria recusado.
        var emitidoEm = claims.getIssuedAt().toInstant();

        return usuarioRepository.findById(id)
                .filter(Usuario::isAtivo)
                .filter(usuario -> !emitidoEm.isBefore(
                        usuario.getSenhaAlteradaEm().toInstant().truncatedTo(ChronoUnit.SECONDS)));
    }

    private void autenticar(Usuario usuario)
    {
        List<SimpleGrantedAuthority> autoridades = usuario.codigosDosPapeis().stream()
                .map(codigo -> new SimpleGrantedAuthority("ROLE_" + codigo))
                .toList();

        var autenticacao = new UsernamePasswordAuthenticationToken(
                new UsuarioAutenticado(usuario.getId(), usuario.getEmail()), null, autoridades);

        SecurityContextHolder.getContext().setAuthentication(autenticacao);
    }
}
