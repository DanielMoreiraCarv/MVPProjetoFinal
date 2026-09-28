package org.example.Services;

import org.example.Models.Federacao;
import org.example.Models.Atleta;
import org.example.Models.Modalidade;
import org.example.Models.Request.EquipeUpdateRequest;
import org.example.Models.Equipe;
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

    public Equipe atualizarEquipe(Long id, EquipeUpdateRequest request) {
        Optional<Equipe> equipeExistente = equipeRepository.findById(id);
        Federacao federacao = new Federacao();
        Modalidade modalidade = new Modalidade();
        if (equipeExistente.isPresent()) {
            if(request.idFederacao()!=null){
                federacaoService.buscarPorId(request.idFederacao());
            }

            if(request.idModalidade()!=null){
                modalidade = modalidadeService.buscarPorId(request.idModalidade());
            }

            Equipe equipe = equipeExistente.get();
            equipe.setNome(request.nome());
            equipe.setModalidade(modalidade);
            equipe.setFederacao( federacao );
            return equipeRepository.save(equipe);
        }
        return null;
    }

    public void deletarEquipe(Long id) {
        equipeRepository.deleteById(id);
    }

    public Equipe adicionarAtletaAEquipe(Long idEquipe, Atleta atleta) {
        Optional<Equipe> equipe = equipeRepository.findById(idEquipe);
        if (equipe.isPresent()) {
            Equipe equipeExistente = equipe.get();
            if (equipeExistente.getLstAtletas() != null) {
                equipeExistente.getLstAtletas().add(atleta);
                return equipeRepository.save(equipeExistente);
            }
        }
        return null;
    }

    public Equipe removerAtletaDaEquipe(Long idEquipe, Long idAtleta) {
        Optional<Equipe> equipe = equipeRepository.findById(idEquipe);
        if (equipe.isPresent()) {
            Equipe equipeExistente = equipe.get();
            if (equipeExistente.getLstAtletas() != null) {
                equipeExistente.getLstAtletas().removeIf(a -> a.getId().equals(idAtleta));
                return equipeRepository.save(equipeExistente);
            }
        }
        return null;
    }

    public List<Atleta> listarAtletasDaEquipe(Long idEquipe) {
        Optional<Equipe> equipe = equipeRepository.findById(idEquipe);
        if (equipe.isPresent()) {
            return equipe.get().getLstAtletas();
        }
        return null;
    }
}
