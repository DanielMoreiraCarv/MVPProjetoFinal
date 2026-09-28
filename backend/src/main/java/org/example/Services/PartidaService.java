package org.example.Services;

import org.example.Models.EnumFasePartida;
import org.example.Models.Partida;
import org.example.Repositories.PartidaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PartidaService {
    
    @Autowired
    private PartidaRepository partidaRepository;
    
    public Partida criarPartida(Partida partida) {
        partida.setId(null);
        return partidaRepository.save(partida);
    }
    
    public Partida buscarPorId(Long id) {
        return partidaRepository.findById(id).orElse(null);
    }
    
    public List<Partida> listarTodas() {
        return partidaRepository.findAll();
    }
    
    public List<Partida> listarPorCompeticao(Long idCompeticao) {
        return partidaRepository.findByCompeticaoId(idCompeticao);
    }
    
    public List<Partida> listarPendentes() {
        return partidaRepository.findByRealizadaFalse();
    }
    
    public List<Partida> listarRealizadas() {
        return partidaRepository.findByRealizadaTrue();
    }
    
    public List<Partida> listarPartidasDoTime(Long idEquipe) {
        List<Partida> partidas = new ArrayList<>(partidaRepository.findByEquipeMandanteId(idEquipe));
        partidas.addAll(partidaRepository.findByEquipeVisitanteId(idEquipe));
        return partidas;
    }
    
    public List<Partida> listarVitoriasDo(Long idEquipe) {
        return partidaRepository.findByIdEquipeVencedora(idEquipe);
    }
    
    public List<Partida> listarPorFase(EnumFasePartida fase) {
        return partidaRepository.findByEnumFasePartida(fase);
    }
    
    public List<Partida> listarPorTabela(Long idTabela) {
        return partidaRepository.findByIdTabela(idTabela);
    }
    
    public Partida atualizarPartida(Long id, Partida partidaAtualizada) {
        Optional<Partida> partidaExistente = partidaRepository.findById(id);
        if (partidaExistente.isPresent()) {
            Partida partida = partidaExistente.get();
            partida.setPlacarMandante(partidaAtualizada.getPlacarMandante());
            partida.setPlacarVisitante(partidaAtualizada.getPlacarVisitante());
            partida.setRealizada(partidaAtualizada.isRealizada());
            partida.setEnumFasePartida(partidaAtualizada.getEnumFasePartida());
            return partidaRepository.save(partida);
        }
        return null;
    }
    
    public Partida definirResultado(Long id, int placarMandante, int placarVisitante) {
        Optional<Partida> partida = partidaRepository.findById(id);
        if (partida.isPresent()) {
            Partida p = partida.get();
            p.setPlacarMandante(placarMandante);
            p.setPlacarVisitante(placarVisitante);
            p.setRealizada(true);
            
            // Define vencedor (empate favorece mandante)
            if (placarMandante > placarVisitante) {
                p.setIdEquipeVencedora(p.getIdEquipeMandante());
            } else if (placarVisitante > placarMandante) {
                p.setIdEquipeVencedora(p.getIdEquipeVisitante());
            } else {
                p.setIdEquipeVencedora(p.getIdEquipeMandante()); // Empate favorece mandante
            }
            
            return partidaRepository.save(p);
        }
        return null;
    }
    
    public void deletarPartida(Long id) {
        partidaRepository.deleteById(id);
    }
}
