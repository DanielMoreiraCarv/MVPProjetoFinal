package org.example.Services;

import org.example.Exception.CampeonatoCreateException;
import org.example.Exception.CampeonatoUpdateException;
import org.example.Mapper.CampeonatoMapper;
import org.example.Models.Campeonato;
import org.example.Models.Request.CampeonatoCreateRequest;
import org.example.Models.Request.CampeonatoUpdateRequest;
import org.example.Models.Time;
import org.example.Repositories.CampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CampeonatoService {
    
    @Autowired
    private CampeonatoRepository campeonatoRepository;
    
    public Campeonato criarCampeonato(Campeonato campeonato) {
        campeonato.setId(null);
        return campeonatoRepository.save(campeonato);
    }

    public Campeonato criar(Campeonato campeonato) throws CampeonatoCreateException {
        campeonato.setId(null);
        return campeonatoRepository.save(campeonato);
    }

    public Campeonato atualizar(CampeonatoUpdateRequest updateRequest) throws CampeonatoUpdateException {
        Campeonato campeonato = campeonatoRepository.findById(updateRequest.id()).orElse(null);
        if (campeonato == null) {
            return null;
        }
        Campeonato atualizado = CampeonatoMapper.toEntity(updateRequest, campeonato);
        return campeonatoRepository.save(atualizado);
    }

    public Campeonato buscarPorId(Long id) {
        return campeonatoRepository.findById(id).orElse(null);
    }
    
    public Campeonato buscarPorNome(String nome) {
        return campeonatoRepository.findByNome(nome).orElse(null);
    }
    
    public List<Campeonato> listarTodos() {
        return campeonatoRepository.findAll();
    }
    
    public List<Campeonato> listarMataMata() {
        return campeonatoRepository.findByMataMata(true);
    }
    
    public List<Campeonato> listarPontosCorridos() {
        return campeonatoRepository.findByMataMata(false);
    }

    public List<Campeonato> listarPorAdministracao(Long idAdministracao) {
        return campeonatoRepository.findByAdministracaoId(idAdministracao);
    }

    public Campeonato atualizarCampeonato(Long id, Campeonato campeonatoAtualizado) {
        Optional<Campeonato> campeonatoExistente = campeonatoRepository.findById(id);
        if (campeonatoExistente.isPresent()) {
            Campeonato campeonato = campeonatoExistente.get();
            campeonato.setNome(campeonatoAtualizado.getNome());
            campeonato.setMataMata(campeonatoAtualizado.isMataMata());
            campeonato.setLstModalidades(campeonatoAtualizado.getLstModalidades());
            return campeonatoRepository.save(campeonato);
        }
        return null;
    }
    
    public void deletarCampeonato(Long id) {
        campeonatoRepository.deleteById(id);
    }
    
    public Campeonato adicionarTimeAoCampeonato(Long idCampeonato, Time time) {
        Optional<Campeonato> campeonato = campeonatoRepository.findById(idCampeonato);
        if (campeonato.isPresent()) {
            campeonato.get().adicionarTime(time);
            return campeonatoRepository.save(campeonato.get());
        }
        return null;
    }
    
    public Campeonato removerTimeDoCapeonato(Long idCampeonato, Time time) {
        Optional<Campeonato> campeonato = campeonatoRepository.findById(idCampeonato);
        if (campeonato.isPresent()) {
            campeonato.get().removerTime(time);
            return campeonatoRepository.save(campeonato.get());
        }
        return null;
    }
}
