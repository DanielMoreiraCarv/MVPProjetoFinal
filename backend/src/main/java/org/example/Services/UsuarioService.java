package org.example.Services;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Administracao;
import org.example.Models.Papel;
import org.example.Models.Usuario;
import org.example.Models.Request.PapelConcedidoRequest;
import org.example.Models.Request.UsuarioCreateRequest;
import org.example.Models.Request.UsuarioUpdateRequest;
import org.example.Repositories.AdministracaoRepository;
import org.example.Repositories.PapelRepository;
import org.example.Repositories.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Gestão de usuários pelo administrador, e as regras de conta que o próprio
 * usuário também segue (e-mail único, senha sempre em hash).
 */
@Service
public class UsuarioService
{
    private final UsuarioRepository usuarioRepository;
    private final PapelRepository papelRepository;
    private final AdministracaoRepository administracaoRepository;
    private final SessaoService sessaoService;
    private final PasswordEncoder codificadorDeSenha;
    private final PessoasDaCompeticaoService pessoasDaCompeticao;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PapelRepository papelRepository,
                          AdministracaoRepository administracaoRepository,
                          SessaoService sessaoService,
                          PasswordEncoder codificadorDeSenha,
                          PessoasDaCompeticaoService pessoasDaCompeticao)
    {
        this.usuarioRepository = usuarioRepository;
        this.papelRepository = papelRepository;
        this.administracaoRepository = administracaoRepository;
        this.sessaoService = sessaoService;
        this.codificadorDeSenha = codificadorDeSenha;
        this.pessoasDaCompeticao = pessoasDaCompeticao;
    }

    public Usuario exigirPorId(Long id)
    {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário " + id + " não encontrado."));
    }

    public List<Usuario> listarTodos()
    {
        return usuarioRepository.findAll(Sort.by("nome"));
    }

    public List<Papel> listarPapeis()
    {
        return papelRepository.findAll(Sort.by("id"));
    }

    @Transactional
    public Usuario criar(UsuarioCreateRequest request)
    {
        return novo(request.nome(), request.email(), request.senha(), request.papeis());
    }

    /** Sem papéis informados, o usuário entra como PUBLICO. */
    @Transactional
    public Usuario novo(String nome, String email, String senha, List<PapelConcedidoRequest> papeis)
    {
        Usuario usuario = new Usuario();
        aplicarNomeEEmail(usuario, nome, email);
        usuario.setSenhaHash(codificadorDeSenha.encode(senha));

        if (papeis == null || papeis.isEmpty())
        {
            usuario.conceder(exigirPapel(Papel.PUBLICO), null);
        }
        else
        {
            concederTodos(usuario, papeis);
        }

        Usuario salvo = usuarioRepository.save(usuario);
        // Convites feitos antes de a pessoa ter conta — pelo cadastro ou criada
        // pela administração, ela já entra nas competições que a esperavam.
        pessoasDaCompeticao.aceitarConvites(salvo);
        return salvo;
    }

    @Transactional
    public Usuario atualizar(Long id, UsuarioUpdateRequest request, Long quemPede)
    {
        Usuario usuario = exigirPorId(id);

        if (id.equals(quemPede) && !request.ativo())
        {
            throw new IllegalArgumentException("Você não pode desativar o próprio usuário.");
        }

        aplicarNomeEEmail(usuario, request.nome(), request.email());
        definirAtivo(usuario, request.ativo());

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario definirPapeis(Long id, List<PapelConcedidoRequest> papeis, Long quemPede)
    {
        Usuario usuario = exigirPorId(id);

        boolean continuaAdministrador = papeis.stream()
                .anyMatch(papel -> Papel.ADMINISTRADOR.equalsIgnoreCase(papel.codigo().trim())
                        && papel.administracaoId() == null);

        // Sem esta trava o único administrador podia tirar o próprio papel e
        // deixar a plataforma sem ninguém capaz de dar papel a alguém.
        if (id.equals(quemPede) && !continuaAdministrador)
        {
            throw new IllegalArgumentException(
                    "Você não pode remover o próprio papel de ADMINISTRADOR. Peça a outro administrador.");
        }

        usuario.getPapeis().clear();
        // O clear e os inserts vão no mesmo flush; sem forçar a remoção antes,
        // reconceder um papel que já existia esbarraria no índice único.
        usuarioRepository.saveAndFlush(usuario);

        concederTodos(usuario, papeis);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario redefinirSenha(Long id, String novaSenha)
    {
        Usuario usuario = exigirPorId(id);
        trocarSenha(usuario, novaSenha);
        // A senha nova costuma vir de quem esqueceu a anterior: o bloqueio por
        // tentativas não faz mais sentido.
        usuario.setTentativasFalhas(0);
        usuario.setBloqueadoAte(null);
        return usuarioRepository.save(usuario);
    }

    /** Não exclui: desativa. O usuário pode ser autor de registros que ficam. */
    @Transactional
    public void desativar(Long id, Long quemPede)
    {
        if (id.equals(quemPede))
        {
            throw new IllegalArgumentException("Você não pode desativar o próprio usuário.");
        }

        Usuario usuario = exigirPorId(id);
        definirAtivo(usuario, false);
        usuarioRepository.save(usuario);
    }

    void aplicarNomeEEmail(Usuario usuario, String nome, String email)
    {
        String emailNormalizado = email.trim().toLowerCase(Locale.ROOT);

        boolean emUso = usuario.getId() == null
                ? usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)
                : usuarioRepository.existsByEmailIgnoreCaseAndIdNot(emailNormalizado, usuario.getId());

        if (emUso)
        {
            throw new IllegalArgumentException("Já existe um usuário com o e-mail " + emailNormalizado + ".");
        }

        usuario.setNome(nome.trim());
        usuario.setEmail(emailNormalizado);
    }

    /**
     * Grava o hash e marca a hora da troca. Os tokens de acesso emitidos antes
     * dela deixam de valer (o filtro confere), e os de renovação são revogados.
     */
    void trocarSenha(Usuario usuario, String novaSenha)
    {
        usuario.setSenhaHash(codificadorDeSenha.encode(novaSenha));
        usuario.setSenhaAlteradaEm(OffsetDateTime.now());
        sessaoService.encerrarTodas(usuario);
    }

    private void definirAtivo(Usuario usuario, boolean ativo)
    {
        if (usuario.isAtivo() && !ativo)
        {
            sessaoService.encerrarTodas(usuario);
        }
        usuario.setAtivo(ativo);
    }

    private void concederTodos(Usuario usuario, List<PapelConcedidoRequest> papeis)
    {
        Set<String> repetidos = new HashSet<>();

        for (PapelConcedidoRequest pedido : papeis)
        {
            String codigo = pedido.codigo().trim().toUpperCase(Locale.ROOT);

            if (!repetidos.add(codigo + "@" + pedido.administracaoId()))
            {
                continue;
            }

            Administracao administracao = pedido.administracaoId() == null
                    ? null
                    : administracaoRepository.findById(pedido.administracaoId())
                            .orElseThrow(() -> NaoEncontradoException.de("Administração", pedido.administracaoId()));

            usuario.conceder(exigirPapel(codigo), administracao);
        }
    }

    private Papel exigirPapel(String codigo)
    {
        return papelRepository.findByCodigo(codigo)
                .orElseThrow(() -> new IllegalArgumentException("O papel " + codigo + " não existe."));
    }
}
