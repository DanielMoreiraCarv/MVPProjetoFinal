package org.example.Services;

import org.example.Mapper.AtletaMapper;
import org.example.Models.Atleta;
import org.example.Models.Modalidade;
import org.example.Models.Request.AtletaCreateRequest;
import org.example.Models.Request.AtletaUpdateRequest;
import org.example.Models.Equipe;
import org.example.Repositories.AtletaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AtletaService {
    
    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private ModalidadeService modalidadeService;
    
    public Atleta criarAtleta( AtletaCreateRequest request, Equipe equipe ) {
        Atleta atleta = AtletaMapper.toEntity( request );
        atleta.setModalidade( modalidadeService.buscarPorId( request.idModalidade() ) );
        atleta.setEquipe( equipe );

        return atletaRepository.save( atleta );
    }
    
    public Atleta buscarPorId(Long id) {
        return atletaRepository.findById(id).orElse(null);
    }
    
    public Atleta buscarPorNome(String nome) {
        return atletaRepository.findByNome(nome).orElse(null);
    }
    
    public Atleta buscarPorCpf(String cpf) {
        return atletaRepository.findByCpf(cpf).orElse(null);
    }
    
    public List<Atleta> listarTodos() {
        return atletaRepository.findAll();
    }
    
    public List<Atleta> listarPorEquipe(Long idEquipe) {
        return atletaRepository.findByEquipeId(idEquipe);
    }

    public List<Atleta> listarPorModalidade(Long idModalidade) {
        return atletaRepository.findByModalidadeId(idModalidade);
    }
    
    public List<Atleta> listarExpulsos() {
        return atletaRepository.findByExpulsoTrue();
    }
    
    public List<Atleta> listarAtivosPorModalidade(Long idModalidade) {
        return atletaRepository.findByModalidadeIdAndExpulsoFalse(idModalidade);
    }
    
    public Atleta atualizarAtleta(Long id, AtletaUpdateRequest atletaAtualizado) {
        Optional<Atleta> jogadorExistente = atletaRepository.findById(id);
        if (jogadorExistente.isPresent()) {
            Atleta atleta = jogadorExistente.get();
            atleta.setNome(atletaAtualizado.nome());
            atleta.setIdade(atletaAtualizado.idade());
            atleta.setNumCamisa(atletaAtualizado.numCamisa());
            atleta.setCpf(atletaAtualizado.cpf());

            Modalidade modalidade =
                    modalidadeService.buscarPorId( atletaAtualizado.idModalidade() );
            atleta.setModalidade(modalidade);
            return atletaRepository.save(atleta);
        }
        return null;
    }
    
    public void deletarAtleta(Long id) {
        atletaRepository.deleteById(id);
    }
    
    public Atleta expulsarAtleta(Long id) {
        Optional<Atleta> atleta = atletaRepository.findById(id);
        if (atleta.isPresent()) {
            Atleta j = atleta.get();
            j.setExpulso(true);
            return atletaRepository.save(j);
        }
        return null;
    }
    
    public Atleta adicionarGol(Long id) {
        Optional<Atleta> atleta = atletaRepository.findById(id);
        if (atleta.isPresent()) {
            Atleta j = atleta.get();
            j.setGols(j.getGols() + 1);
            return atletaRepository.save(j);
        }
        return null;
    }
    
    public Atleta adicionarAssistencia(Long id) {
        Optional<Atleta> atleta = atletaRepository.findById(id);
        if (atleta.isPresent()) {
            Atleta j = atleta.get();
            j.setAssistencias(j.getAssistencias() + 1);
            return atletaRepository.save(j);
        }
        return null;
    }
    
    public Atleta adicionarCartao(Long id) {
        Optional<Atleta> atleta = atletaRepository.findById(id);
        if (atleta.isPresent()) {
            Atleta j = atleta.get();
            j.setCartoes(j.getCartoes() + 1);
            return atletaRepository.save(j);
        }
        return null;
    }
}
