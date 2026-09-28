package org.example.Services;

import org.example.Exception.CompeticaoCreateException;
import org.example.Exception.NaoEncontradoException;
import org.example.Exception.CompeticaoUpdateException;
import org.example.Mapper.CompeticaoMapper;
import org.example.Models.Competicao;
import org.example.Models.Request.CompeticaoCreateRequest;
import org.example.Models.Request.CompeticaoUpdateRequest;
import org.example.Models.Equipe;
import org.example.Repositories.CompeticaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompeticaoService {
    
    @Autowired
    private CompeticaoRepository competicaoRepository;
    
    public Competicao criarCompeticao(Competicao competicao) {
        competicao.setId(null);
        return competicaoRepository.save(competicao);
    }

    public Competicao criar(Competicao competicao) throws CompeticaoCreateException {
        competicao.setId(null);
        return competicaoRepository.save(competicao);
    }

    public Competicao atualizar(CompeticaoUpdateRequest updateRequest) throws CompeticaoUpdateException {
        Competicao competicao = competicaoRepository.findById(updateRequest.id()).orElse(null);
        if (competicao == null) {
            return null;
        }
        Competicao atualizado = CompeticaoMapper.toEntity(updateRequest, competicao);
        return competicaoRepository.save(atualizado);
    }

    public Competicao buscarPorId(Long id) {
        return competicaoRepository.findById(id).orElse(null);
    }
    
    public Competicao buscarPorNome(String nome) {
        return competicaoRepository.findByNome(nome).orElse(null);
    }
    
    public List<Competicao> listarTodos() {
        return competicaoRepository.findAll();
    }
    
    public List<Competicao> listarMataMata() {
        return competicaoRepository.findByMataMata(true);
    }
    
    public List<Competicao> listarPontosCorridos() {
        return competicaoRepository.findByMataMata(false);
    }

    public List<Competicao> listarPorAdministracao(Long idAdministracao) {
        return competicaoRepository.findByAdministracaoId(idAdministracao);
    }

    public Competicao atualizarCompeticao(Long id, Competicao competicaoAtualizado) {
        Optional<Competicao> competicaoExistente = competicaoRepository.findById(id);
        if (competicaoExistente.isPresent()) {
            Competicao competicao = competicaoExistente.get();
            competicao.setNome(competicaoAtualizado.getNome());
            competicao.setMataMata(competicaoAtualizado.isMataMata());
            competicao.setLstModalidades(competicaoAtualizado.getLstModalidades());
            return competicaoRepository.save(competicao);
        }
        return null;
    }
    
    public void deletarCompeticao(Long id) {
        competicaoRepository.deleteById(id);
    }
    
    public Competicao adicionarEquipeACompeticao(Long idCompeticao, Equipe equipe) {
        Competicao competicao = competicaoRepository.findById(idCompeticao)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", idCompeticao));

        competicao.adicionarEquipe(equipe);
        return competicaoRepository.save(competicao);
    }

    public Competicao removerEquipeDaCompeticao(Long idCompeticao, Long idEquipe) {
        Competicao competicao = competicaoRepository.findById(idCompeticao)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", idCompeticao));

        if (!competicao.removerEquipe(idEquipe)) {
            throw new IllegalArgumentException(
                    "A equipe não está inscrita em " + competicao.getNome() + ".");
        }

        return competicaoRepository.save(competicao);
    }
}
