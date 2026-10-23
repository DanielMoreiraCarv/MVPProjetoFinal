package org.example.Seguranca;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.Models.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Emite e confere o token de acesso.
 *
 * HS256 com um segredo só, vindo do ambiente (JWT_SEGREDO). Todas as
 * instâncias precisam do mesmo valor: o token emitido por uma é conferido por
 * outra. Sem a variável, um segredo aleatório é gerado no boot — serve para
 * desenvolver, mas cada reinício derruba todas as sessões, e com mais de uma
 * instância o login simplesmente não funciona.
 */
@Service
public class ServicoDeJwt
{
    private static final Logger LOG = LoggerFactory.getLogger(ServicoDeJwt.class);

    /** HS256 exige chave de ao menos 256 bits. */
    private static final int BYTES_MINIMOS_DO_SEGREDO = 32;

    private static final String EMISSOR = "projeto-final-integrador";

    private final SecretKey chave;
    private final Duration validade;

    public ServicoDeJwt(
            @Value("${auth.jwt.segredo:}") String segredo,
            @Value("${auth.jwt.validade-minutos:15}") long validadeMinutos)
    {
        this.chave = chaveDe(segredo);
        this.validade = Duration.ofMinutes(validadeMinutos);
    }

    private static SecretKey chaveDe(String segredo)
    {
        if (segredo == null || segredo.isBlank())
        {
            LOG.warn("JWT_SEGREDO não definido: usando um segredo aleatório. "
                    + "As sessões não sobrevivem a um reinício. Defina a variável em produção.");
            return Jwts.SIG.HS256.key().build();
        }

        byte[] bytes = segredo.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < BYTES_MINIMOS_DO_SEGREDO)
        {
            throw new IllegalStateException("JWT_SEGREDO precisa ter ao menos "
                    + BYTES_MINIMOS_DO_SEGREDO + " bytes. Gere um com: openssl rand -base64 48");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public TokenEmitido emitir(Usuario usuario)
    {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(validade);

        String token = Jwts.builder()
                .issuer(EMISSOR)
                .subject(usuario.getId().toString())
                .claim("email", usuario.getEmail())
                .claim("papeis", List.copyOf(usuario.codigosDosPapeis()))
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiraEm))
                .signWith(chave)
                .compact();

        return new TokenEmitido(token, expiraEm);
    }

    /** Vazio quando a assinatura não confere, o token venceu ou está malformado. */
    public Optional<Claims> conferir(String token)
    {
        try
        {
            return Optional.of(Jwts.parser()
                    .verifyWith(chave)
                    .requireIssuer(EMISSOR)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload());
        }
        catch (JwtException | IllegalArgumentException recusado)
        {
            return Optional.empty();
        }
    }

    public record TokenEmitido(String token, Instant expiraEm)
    {
    }
}
