package org.example.Services;

import java.util.List;
import org.example.Models.Request.PapelConcedidoRequest;
import org.example.Models.Papel;
import org.example.Exception.AutenticacaoException;
import org.example.Models.Usuario;
import org.example.Models.Request.AlteracaoDeSenhaRequest;
import org.example.Models.Request.CadastroRequest;
import org.example.Models.Request.LoginRequest;
import org.example.Models.Request.PerfilUpdateRequest;
import org.example.Models.Response.AutenticacaoResponse;
import org.example.Repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;

/**
 * O que o próprio usuário faz com a conta: entrar, cadastrar-se, editar o
 * perfil e trocar a senha.
 */
@Service
public class AutenticacaoService
{
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final SessaoService sessaoService;
    private final PasswordEncoder codificadorDeSenha;
    private final int tentativasAteBloquear;
    private final Duration duracaoDoBloqueio;
    private final boolean cadastroAberto;

    /**
     * Hash de uma senha qualquer, para conferir contra ela quando o e-mail não
     * existe. Sem isto o login de e-mail inexistente responderia mais rápido
     * (não roda o BCrypt), e o tempo de resposta diria quais e-mails existem.
     */
    private final String hashParaEmailInexistente;

    public AutenticacaoService(UsuarioRepository usuarioRepository,
                               UsuarioService usuarioService,
                               SessaoService sessaoService,
                               PasswordEncoder codificadorDeSenha,
                               @Value("${auth.login.tentativas-ate-bloquear:5}") int tentativasAteBloquear,
                               @Value("${auth.login.bloqueio-minutos:15}") long minutosDeBloqueio,
                               @Value("${auth.cadastro-aberto:true}") boolean cadastroAberto)
    {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.sessaoService = sessaoService;
        this.codificadorDeSenha = codificadorDeSenha;
        this.tentativasAteBloquear = tentativasAteBloquear;
        this.duracaoDoBloqueio = Duration.ofMinutes(minutosDeBloqueio);
        this.cadastroAberto = cadastroAberto;
        this.hashParaEmailInexistente = codificadorDeSenha.encode("senha-que-ninguem-tem-1");
    }

    /**
     * A contagem de erros precisa ser gravada justamente quando o login falha,
     * por isso a exceção de autenticação não desfaz a transação.
     */
    @Transactional(noRollbackFor = AutenticacaoException.class)
    public AutenticacaoResponse entrar(LoginRequest request)
    {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email().trim()).orElse(null);

        if (usuario == null)
        {
            codificadorDeSenha.matches(request.senha(), hashParaEmailInexistente);
            throw AutenticacaoException.credenciaisInvalidas();
        }

        if (usuario.bloqueado())
        {
            throw contaBloqueada();
        }

        if (!codificadorDeSenha.matches(request.senha(), usuario.getSenhaHash()))
        {
            registrarFalha(usuario);
            throw usuario.bloqueado() ? contaBloqueada() : AutenticacaoException.credenciaisInvalidas();
        }

        // Só depois de conferir a senha, para não revelar a quem não a sabe
        // que a conta existe e está desativada.
        if (!usuario.isAtivo())
        {
            throw new AutenticacaoException(HttpStatus.UNAUTHORIZED, "USUARIO_INATIVO",
                    "Este usuário está desativado. Fale com um administrador.");
        }

        usuario.setTentativasFalhas(0);
        usuario.setBloqueadoAte(null);

        return sessaoService.abrir(usuario);
    }

    private void registrarFalha(Usuario usuario)
    {
        int falhas = usuario.getTentativasFalhas() + 1;

        if (falhas >= tentativasAteBloquear)
        {
            usuario.setBloqueadoAte(OffsetDateTime.now().plus(duracaoDoBloqueio));
            falhas = 0;
        }
        usuario.setTentativasFalhas(falhas);
    }

    private AutenticacaoException contaBloqueada()
    {
        return new AutenticacaoException(HttpStatus.TOO_MANY_REQUESTS, "CONTA_BLOQUEADA",
                "Muitas tentativas com senha errada. Tente de novo em "
                        + duracaoDoBloqueio.toMinutes() + " minutos.");
    }

    /**
     * Quem se cadastra organiza as próprias competições: entra como
     * ORGANIZADOR, vê o que criar e o que for compartilhado com ele. A
     * administração da plataforma não se ganha pelo cadastro.
     */
    @Transactional
    public AutenticacaoResponse cadastrar(CadastroRequest request)
    {
        if (!cadastroAberto)
        {
            throw new AutenticacaoException(HttpStatus.FORBIDDEN, "CADASTRO_FECHADO",
                    "O cadastro está fechado. Peça a um administrador que crie seu usuário.");
        }

        Usuario usuario = usuarioService.novo(request.nome(), request.email(), request.senha(),
                List.of(new PapelConcedidoRequest(Papel.ORGANIZADOR, null)));
        return sessaoService.abrir(usuario);
    }

    public Usuario eu(Long id)
    {
        return usuarioService.exigirPorId(id);
    }

    @Transactional
    public Usuario atualizarPerfil(Long id, PerfilUpdateRequest request)
    {
        Usuario usuario = usuarioService.exigirPorId(id);
        usuarioService.aplicarNomeEEmail(usuario, request.nome(), request.email());
        return usuarioRepository.save(usuario);
    }

    /**
     * Trocar a senha encerra as sessões abertas em outros aparelhos — quem
     * troca a senha costuma estar desconfiado de que alguém a conhece. Devolve
     * uma sessão nova para quem trocou não ser deslogado junto.
     */
    @Transactional
    public AutenticacaoResponse alterarSenha(Long id, AlteracaoDeSenhaRequest request)
    {
        Usuario usuario = usuarioService.exigirPorId(id);

        if (!codificadorDeSenha.matches(request.senhaAtual(), usuario.getSenhaHash()))
        {
            throw new IllegalArgumentException("A senha atual não confere.");
        }

        if (codificadorDeSenha.matches(request.novaSenha(), usuario.getSenhaHash()))
        {
            throw new IllegalArgumentException("A nova senha precisa ser diferente da atual.");
        }

        usuarioService.trocarSenha(usuario, request.novaSenha());
        return sessaoService.abrir(usuario);
    }
}
