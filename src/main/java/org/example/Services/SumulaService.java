package org.example.Services;

import org.example.Models.Sumula;
import org.example.Repositories.SumulaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SumulaService {
    
    @Autowired
    private SumulaRepository sumulaRepository;
    
    public Sumula criarSumula(Sumula sumula) {
        sumula.setId(null);
        return sumulaRepository.save(sumula);
    }
    
    public Sumula buscarPorId(Long id) {
        return sumulaRepository.findById(id).orElse(null);
    }
    
    public List<Sumula> listarTodas() {
        return sumulaRepository.findAll();
    }
    
    public List<Sumula> listarAssinadas() {
        return sumulaRepository.findByAssinadaTrue();
    }
    
    public List<Sumula> listarPendentes() {
        return sumulaRepository.findByAssinadaFalse();
    }
    
    public Sumula buscarPorPartida(Long idPartida) {
        return sumulaRepository.findByPartidaId(idPartida).orElse(null);
    }
    
    public List<Sumula> listarPorArbitro(Long idArbitro) {
        return sumulaRepository.findByArbitroId(idArbitro);
    }
    
    public Sumula atualizarSumula(Long id, Sumula sumulaAtualizada) {
        Optional<Sumula> sumulaExistente = sumulaRepository.findById(id);
        if (sumulaExistente.isPresent()) {
            Sumula sumula = sumulaExistente.get();
            sumula.setGolsMandante(sumulaAtualizada.getGolsMandante());
            sumula.setGolsVisitante(sumulaAtualizada.getGolsVisitante());
            sumula.setObservacoesRelatadas(sumulaAtualizada.getObservacoesRelatadas());
            return sumulaRepository.save(sumula);
        }
        return null;
    }
    
    public Sumula finalizarSumula(Long id, int golsMandante, int golsVisitante, String relato) {
        Optional<Sumula> sumula = sumulaRepository.findById(id);
        if (sumula.isPresent()) {
            Sumula s = sumula.get();
            s.finalizarSumula(golsMandante, golsVisitante, relato);
            return sumulaRepository.save(s);
        }
        return null;
    }
    
    public Sumula adicionarOcorrencia(Long id, String evento) {
        Optional<Sumula> sumula = sumulaRepository.findById(id);
        if (sumula.isPresent()) {
            Sumula s = sumula.get();
            s.adicionarOcorrencia(evento);
            return sumulaRepository.save(s);
        }
        return null;
    }
    
    public void deletarSumula(Long id) {
        sumulaRepository.deleteById(id);
    }
}
