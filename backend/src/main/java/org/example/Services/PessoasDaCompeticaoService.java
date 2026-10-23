package org.example.Services;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Competicao;
import org.example.Models.ConviteDaCompeticao;
import org.example.Models.Usuario;
import org.example.Models.Response.PessoasDaCompeticaoResponse;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.ConviteDaCompeticaoRepository;
import org.example.Repositories.UsuarioRepository;
import org.example.Seguranca.UsuarioCorrente;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Locale;

/**
 * Com quem a competição é compartilhada. Convidar quem já tem conta a põe
 * na competição na hora; quem ainda não tem fica como convite pelo e-mail, e
 * entra ao se cadastrar com ele. Não há envio de e-mail: quem convida avisa.
 */
@Service
public class PessoasDaCompeticaoService
{
    private final CompeticaoRepository competicaoRepository;
    private final ConviteDaCompeticaoRepository conviteRepository;
    private final UsuarioRepository usuarioRepository;

    public PessoasDaCompeticaoService(CompeticaoRepository competicaoRepository,
                                      ConviteDaCompeticaoRepository conviteRepository,
                                      UsuarioRepository usuarioRepository)
    {
        this.competicaoRepository = competicaoRepository;
        this.conviteRepository = conviteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public PessoasDaCompeticaoResponse listar(Long idCompeticao)
    {
        Competicao competicao = exigirCompeticao(idCompeticao);
        Long eu = UsuarioCorrente.id().orElse(null);

        var participantes = usuarioRepository.findAllById(competicao.getParticipantes()).stream()
                .sorted(Comparator.comparing(Usuario::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(usuario -> new PessoasDaCompeticaoResponse.Participante(
                        usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getId().equals(eu)))
                .toList();

        var convites = conviteRepository.findByIdCompeticaoOrderByCriadoEm(idCompeticao).stream()
                .map(convite -> new PessoasDaCompeticaoResponse.Convite(
                        convite.getId(), convite.getEmail(), convite.getCriadoEm()))
                .toList();

        return new PessoasDaCompeticaoResponse(participantes, convites);
    }

    /** Idempotente: convidar duas vezes não duplica nem reclama. */
    @Transactional
    public PessoasDaCompeticaoResponse convidar(Long idCompeticao, String email)
    {
        Competicao competicao = exigirCompeticao(idCompeticao);
        String normalizado = email.trim().toLowerCase(Locale.ROOT);

        usuarioRepository.findByEmailIgnoreCase(normalizado).ifPresentOrElse(
                usuario -> competicao.getParticipantes().add(usuario.getId()),
                () -> {
                    if (conviteRepository.findByIdCompeticaoAndEmail(idCompeticao, normalizado).isEmpty())
                    {
                        ConviteDaCompeticao convite = new ConviteDaCompeticao();
                        convite.setIdCompeticao(idCompeticao);
                        convite.setEmail(normalizado);
                        convite.setConvidadoPor(UsuarioCorrente.id().orElse(null));
                        conviteRepository.save(convite);
                    }
                });

        competicaoRepository.save(competicao);
        return listar(idCompeticao);
    }

    /**
     * Tira alguém — inclusive a si mesmo, que é como se sai de uma competição.
     * A última pessoa não sai: a competição ficaria sem ninguém que a visse.
     */
    @Transactional
    public PessoasDaCompeticaoResponse remover(Long idCompeticao, Long idUsuario)
    {
        Competicao competicao = exigirCompeticao(idCompeticao);

        if (!competicao.getParticipantes().contains(idUsuario))
        {
            throw new NaoEncontradoException("Essa pessoa não participa da competição.");
        }
        if (competicao.getParticipantes().size() == 1)
        {
            throw new IllegalArgumentException(
                    "A competição precisa de ao menos uma pessoa. Convide outra antes de sair.");
        }

        competicao.getParticipantes().remove(idUsuario);
        competicaoRepository.save(competicao);
        return listar(idCompeticao);
    }

    @Transactional
    public PessoasDaCompeticaoResponse cancelarConvite(Long idCompeticao, Long idConvite)
    {
        ConviteDaCompeticao convite = conviteRepository.findById(idConvite)
                .filter(encontrado -> encontrado.getIdCompeticao().equals(idCompeticao))
                .orElseThrow(() -> NaoEncontradoException.de("Convite", idConvite));

        conviteRepository.delete(convite);
        return listar(idCompeticao);
    }

    /** Quem acaba de ganhar conta entra nas competições para as quais foi convidado. */
    @Transactional
    public void aceitarConvites(Usuario usuario)
    {
        for (ConviteDaCompeticao convite : conviteRepository.findByEmail(usuario.getEmail()))
        {
            competicaoRepository.findById(convite.getIdCompeticao()).ifPresent(competicao -> {
                competicao.getParticipantes().add(usuario.getId());
                competicaoRepository.save(competicao);
            });
            conviteRepository.delete(convite);
        }
    }

    private Competicao exigirCompeticao(Long id)
    {
        return competicaoRepository.findById(id)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", id));
    }
}
