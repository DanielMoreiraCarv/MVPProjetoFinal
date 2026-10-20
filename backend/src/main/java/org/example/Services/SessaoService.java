package org.example.Services;

import org.example.Exception.AutenticacaoException;
import org.example.Mapper.UsuarioMapper;
import org.example.Models.TokenRenovacao;
import org.example.Models.Usuario;
import org.example.Models.Response.AutenticacaoResponse;
import org.example.Repositories.TokenRenovacaoRepository;
import org.example.Seguranca.ServicoDeJwt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Abre, renova e encerra sessões: o par token de acesso + token de renovação.
 *
 * A renovação é de uso único. Cada uso revoga o token apresentado e entrega
 * outro; se um token já revogado volta a aparecer, alguém o copiou — e como
 * não dá para saber qual dos dois é o dono legítimo, todas as sessões do
 * usuário são encerradas.
 */
@Service
public class SessaoService
{
    private static final Logger LOG = LoggerFactory.getLogger(SessaoService.class);

    private static final SecureRandom ALEATORIO = new SecureRandom();
    private static final int BYTES_DO_TOKEN = 32;

    private final ServicoDeJwt servicoDeJwt;
    private final TokenRenovacaoRepository tokenRenovacaoRepository;
    private final long validadeDaRenovacaoEmDias;

    public SessaoService(ServicoDeJwt servicoDeJwt,
                         TokenRenovacaoRepository tokenRenovacaoRepository,
                         @Value("${auth.renovacao.validade-dias:7}") long validadeDaRenovacaoEmDias)
    {
        this.servicoDeJwt = servicoDeJwt;
        this.tokenRenovacaoRepository = tokenRenovacaoRepository;
        this.validadeDaRenovacaoEmDias = validadeDaRenovacaoEmDias;
    }

    @Transactional
    public AutenticacaoResponse abrir(Usuario usuario)
    {
        ServicoDeJwt.TokenEmitido acesso = servicoDeJwt.emitir(usuario);

        String tokenRenovacao = gerarToken();
        TokenRenovacao registro = new TokenRenovacao();
        registro.setUsuario(usuario);
        registro.setTokenHash(hash(tokenRenovacao));
        registro.setExpiraEm(OffsetDateTime.now().plusDays(validadeDaRenovacaoEmDias));
        tokenRenovacaoRepository.save(registro);

        return new AutenticacaoResponse(acesso.token(), "Bearer",
                OffsetDateTime.ofInstant(acesso.expiraEm(), ZoneOffset.UTC),
                tokenRenovacao, UsuarioMapper.toResponse(usuario));
    }

    // Sem rollback na falha: a revogação em massa do reuso precisa ficar
    // gravada mesmo com a exceção subindo.
    @Transactional(noRollbackFor = AutenticacaoException.class)
    public AutenticacaoResponse renovar(String tokenRenovacao)
    {
        TokenRenovacao registro = tokenRenovacaoRepository.findByTokenHash(hash(tokenRenovacao))
                .orElseThrow(AutenticacaoException::sessaoInvalida);

        Usuario usuario = registro.getUsuario();

        if (registro.getRevogadoEm() != null)
        {
            LOG.warn("token de renovação reutilizado para o usuário {}: encerrando todas as sessões",
                    usuario.getId());
            encerrarTodas(usuario);
            throw AutenticacaoException.sessaoInvalida();
        }

        if (!registro.valido() || !usuario.isAtivo())
        {
            throw AutenticacaoException.sessaoInvalida();
        }

        registro.setRevogadoEm(OffsetDateTime.now());
        return abrir(usuario);
    }

    /** Idempotente: sair com um token já inválido não é erro. */
    @Transactional
    public void encerrar(String tokenRenovacao)
    {
        tokenRenovacaoRepository.findByTokenHash(hash(tokenRenovacao))
                .filter(registro -> registro.getRevogadoEm() == null)
                .ifPresent(registro -> registro.setRevogadoEm(OffsetDateTime.now()));
    }

    @Transactional
    public void encerrarTodas(Usuario usuario)
    {
        tokenRenovacaoRepository.revogarTodosDoUsuario(usuario.getId(), OffsetDateTime.now());
    }

    private static String gerarToken()
    {
        byte[] bytes = new byte[BYTES_DO_TOKEN];
        ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * SHA-256 basta aqui, ao contrário da senha: o token tem 256 bits de
     * entropia, não há dicionário que o adivinhe, e a busca precisa ser exata.
     */
    private static String hash(String token)
    {
        try
        {
            byte[] resumo = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resumo);
        }
        catch (NoSuchAlgorithmException impossivel)
        {
            throw new IllegalStateException("SHA-256 indisponível na JVM", impossivel);
        }
    }
}
