package org.example.Services;

import org.example.Models.Campeonato;
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
        return campeonatoRepository.save(campeonato);
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
    
    public Campeonato atualizarCampeonato(Long id, Campeonato campeonatoAtualizado) {
        Optional<Campeonato> campeonatoExistente = campeonatoRepository.findById(id);
        if (campeonatoExistente.isPresent()) {
            Campeonato campeonato = campeonatoExistente.get();
            campeonato.setNome(campeonatoAtualizado.getNome());
            campeonato.setMataMata(campeonatoAtualizado.isMataMata());
            campeonato.setEnumTipoEsporte(campeonatoAtualizado.getEnumTipoEsporte());
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
