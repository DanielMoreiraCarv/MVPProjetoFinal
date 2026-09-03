package org.example.Services;

import org.example.Models.Jogadores;
import org.example.Models.Time;
import org.example.Repositories.TimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TimeService {
    
    @Autowired
    private TimeRepository timeRepository;
    
    public Time criarTime(Time time) {
        time.setId(null);
        return timeRepository.save(time);
    }
    
    public Time buscarPorId(Long id) {
        return timeRepository.findById(id).orElse(null);
    }
    
    public Time buscarPorNome(String nome) {
        return timeRepository.findByNome(nome).orElse(null);
    }
    
    public List<Time> listarTodos() {
        return timeRepository.findAll();
    }
    
    public List<Time> listarPorModalidade(Long idModalidade) {
        return timeRepository.findByModalidadeId(idModalidade);
    }
    
    public Time atualizarTime(Long id, Time timeAtualizado) {
        Optional<Time> timeExistente = timeRepository.findById(id);
        if (timeExistente.isPresent()) {
            Time time = timeExistente.get();
            time.setNome(timeAtualizado.getNome());
            time.setModalidade(timeAtualizado.getModalidade());
            time.setLstJogadores(timeAtualizado.getLstJogadores());
            return timeRepository.save(time);
        }
        return null;
    }
    
    public void deletarTime(Long id) {
        timeRepository.deleteById(id);
    }
    
    public Time adicionarJogadorAoTime(Long idTime, Jogadores jogador) {
        Optional<Time> time = timeRepository.findById(idTime);
        if (time.isPresent()) {
            Time timeExistente = time.get();
            if (timeExistente.getLstJogadores() != null) {
                timeExistente.getLstJogadores().add(jogador);
                return timeRepository.save(timeExistente);
            }
        }
        return null;
    }
    
    public Time removerJogadorDoTime(Long idTime, Long idJogador) {
        Optional<Time> time = timeRepository.findById(idTime);
        if (time.isPresent()) {
            Time timeExistente = time.get();
            if (timeExistente.getLstJogadores() != null) {
                timeExistente.getLstJogadores().removeIf(j -> j.getId().equals(idJogador));
                return timeRepository.save(timeExistente);
            }
        }
        return null;
    }
    
    public List<Jogadores> listarJogadoresDoTime(Long idTime) {
        Optional<Time> time = timeRepository.findById(idTime);
        if (time.isPresent()) {
            return time.get().getLstJogadores();
        }
        return null;
    }
}
