package org.example.Services;

import org.example.Models.Federacao;
import org.example.Models.Atleta;
import org.example.Models.Modalidade;
import org.example.Models.Request.EquipeUpdateRequest;
import org.example.Models.Equipe;
import org.example.Exception.NaoEncontradoException;
import org.example.Repositories.AtletaRepository;
import org.example.Repositories.EquipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquipeService {

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private FederacaoService federacaoService;

    @Autowired
    private ModalidadeService modalidadeService;

    public Equipe criarEquipe(Equipe equipe) {
        equipe.setId(null);
        return equipeRepository.save(equipe);
    }

    public Equipe buscarPorId(Long id) {
        return equipeRepository.findById(id).orElse(null);
    }

    public Equipe buscarPorNome(String nome) {
        return equipeRepository.findByNome(nome).orElse(null);
    }

    public List<Equipe> listarTodos() {
        return equipeRepository.findAll();
    }

    public List<Equipe> listarPorModalidade(Long idModalidade) {
        return equipeRepository.findByModalidadeId(idModalidade);
    }

    /**
     * Campo ausente no pedido é campo que não muda.
     *
     * O que havia aqui montava uma `Federacao` e uma `Modalidade` vazias e as
     * atribuía sempre — inclusive quando o pedido não citava nenhuma das duas,
     * e inclusive descartando o resultado da busca da federação, que era
     * chamada e jogada fora. Renomear uma equipe apagava a federação e a
     * modalidade dela, e gravava entidades transientes no lugar.
     */
    public Equipe atualizarEquipe(Long id, EquipeUpdateRequest request) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> NaoEncontradoException.de("Equipe", id));

        if (request.nome() != null && !request.nome().isBlank()) {
            equipe.setNome(request.nome());
        }

        if (request.idFederacao() != null) {
            equipe.setFederacao(federacaoService.exigirPorId(request.idFederacao()));
        }

        if (request.idModalidade() != null) {
            Modalidade modalidade = modalidadeService.buscarPorId(request.idModalidade());
            if (modalidade == null) {
                throw NaoEncontradoException.de("Modalidade", request.idModalidade());
            }
            equipe.setModalidade(modalidade);
        }

        return equipeRepository.save(equipe);
    }

    public void deletarEquipe(Long id) {
        equipeRepository.deleteById(id);
    }

    /**
     * O elenco é derivado de `atleta.equipe_id`, então entrar e sair da equipe
     * é escrita no atleta — mexer na lista da equipe não persistiria nada.
     */
    public Equipe adicionarAtletaAEquipe(Long idEquipe, Long idAtleta) {
        Equipe equipe = equipeRepository.findById(idEquipe)
                .orElseThrow(() -> NaoEncontradoException.de("Equipe", idEquipe));

        Atleta atleta = atletaRepository.findById(idAtleta)
                .orElseThrow(() -> NaoEncontradoException.de("Atleta", idAtleta));

        if (atleta.getModalidade() != null && equipe.getModalidade() != null
                && !atleta.getModalidade().getId().equals(equipe.getModalidade().getId())) {
            throw new IllegalArgumentException(
                    "O atleta " + atleta.getNome() + " é de outra modalidade e não pode entrar em "
                            + equipe.getNome() + ".");
        }

        equipe.receberAtleta(atleta);
        atletaRepository.save(atleta);
        return equipe;
    }

    public Equipe removerAtletaDaEquipe(Long idEquipe, Long idAtleta) {
        Equipe equipe = equipeRepository.findById(idEquipe)
                .orElseThrow(() -> NaoEncontradoException.de("Equipe", idEquipe));

        Atleta atleta = atletaRepository.findById(idAtleta)
                .orElseThrow(() -> NaoEncontradoException.de("Atleta", idAtleta));

        if (atleta.getEquipe() == null || !atleta.getEquipe().getId().equals(idEquipe)) {
            throw new IllegalArgumentException(
                    "O atleta " + atleta.getNome() + " não está em " + equipe.getNome() + ".");
        }

        // Sai da equipe, continua cadastrado: atleta é pessoa, não item de
        // elenco. Apagar junto perderia o histórico dele.
        equipe.dispensarAtleta(atleta);
        atletaRepository.save(atleta);
        return equipe;
    }

    public List<Atleta> listarAtletasDaEquipe(Long idEquipe) {
        if (!equipeRepository.existsById(idEquipe)) {
            throw NaoEncontradoException.de("Equipe", idEquipe);
        }
        return atletaRepository.findByEquipeId(idEquipe);
    }
}
