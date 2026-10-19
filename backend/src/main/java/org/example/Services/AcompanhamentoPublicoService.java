package org.example.Services;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Competicao;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.PartidaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * A porta do acompanhamento por link: tudo o que sai pelas rotas públicas
 * passa por aqui antes, e só passa o que pertence a uma competição aberta ao
 * público.
 *
 * Fechada e inexistente dão a mesma resposta — "não encontrada" —, para o
 * link não servir de sonda de quais competições existem.
 */
@Service
public class AcompanhamentoPublicoService {

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private FaseRepository faseRepository;

    public List<Competicao> listarAbertas() {
        return competicaoRepository.findByPublicaTrue();
    }

    public Competicao exigirAberta(Long idCompeticao) {
        return competicaoRepository.findById(idCompeticao)
                .filter(Competicao::isPublica)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", idCompeticao));
    }

    public void exigirPartidaAberta(Long idPartida) {
        boolean aberta = partidaRepository.findById(idPartida)
                .map(partida -> partida.getCompeticao() != null && partida.getCompeticao().isPublica())
                .orElse(false);

        if (!aberta) {
            throw NaoEncontradoException.de("Partida", idPartida);
        }
    }

    public void exigirFaseAberta(Long idFase) {
        boolean aberta = faseRepository.findById(idFase)
                .map(fase -> fase.getCompeticao() != null && fase.getCompeticao().isPublica())
                .orElse(false);

        if (!aberta) {
            throw NaoEncontradoException.de("Fase", idFase);
        }
    }

    /** O elenco aparece se a equipe disputa alguma competição aberta. */
    public void exigirEquipeEmCompeticaoAberta(Long idEquipe) {
        if (!competicaoRepository.existsByPublicaTrueAndLstEquipes_Id(idEquipe)) {
            throw NaoEncontradoException.de("Equipe", idEquipe);
        }
    }
}
