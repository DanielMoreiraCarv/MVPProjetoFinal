package org.example.Services;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Partida;
import org.example.Models.Request.SumulaCreateRequest;
import org.example.Models.Request.SumulaUpdateRequest;
import org.example.Repositories.ArbitroRepository;
import org.example.Models.Sumula;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.SumulaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SumulaService {
    
    @Autowired
    private SumulaRepository sumulaRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private ArbitroRepository arbitroRepository;

    public Sumula criar(SumulaCreateRequest request) {
        Partida partida = partidaRepository.findById(request.idPartida())
                .orElseThrow(() -> NaoEncontradoException.de("Partida", request.idPartida()));

        if (partida.getSumula() != null) {
            throw new IllegalStateException(
                    "Esta partida já tem súmula. Abra a que existe em vez de criar outra.");
        }

        Sumula sumula = new Sumula();
        if (request.idArbitro() != null) {
            sumula.setArbitro(arbitroRepository.findById(request.idArbitro())
                    .orElseThrow(() -> NaoEncontradoException.de("Árbitro", request.idArbitro())));
        }
        else if (partida.getArbitro() != null) {
            // Sem árbitro no pedido, herda o que já está escalado na partida:
            // é quem conduz o jogo, e repetir a escolha é trabalho à toa.
            sumula.setArbitro(partida.getArbitro());
        }

        partida.vincularSumula(sumula);
        return sumulaRepository.save(sumula);
    }

    public Sumula exigirPorId(Long id) {
        return sumulaRepository.findById(id)
                .orElseThrow(() -> NaoEncontradoException.de("Súmula", id));
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
    
    /**
     * Campo ausente é campo que não muda. O que havia aqui copiava placar e
     * observações do corpo sempre — e como o corpo era a entidade crua, um
     * pedido que só quisesse trocar o árbitro zerava o placar.
     */
    public Sumula atualizar(Long id, SumulaUpdateRequest request) {
        Sumula sumula = exigirPorId(id);

        if (sumula.isAssinada()) {
            throw new IllegalStateException(
                    "Esta súmula já foi assinada e não aceita alteração.");
        }

        if (request.idArbitro() != null) {
            sumula.setArbitro(arbitroRepository.findById(request.idArbitro())
                    .orElseThrow(() -> NaoEncontradoException.de("Árbitro", request.idArbitro())));
        }
        if (request.placarMandante() != null) {
            sumula.setPlacarMandante(request.placarMandante());
        }
        if (request.placarVisitante() != null) {
            sumula.setPlacarVisitante(request.placarVisitante());
        }
        if (request.observacoes() != null) {
            sumula.setObservacoesRelatadas(request.observacoes());
        }

        return sumulaRepository.save(sumula);
    }
    
    public Sumula finalizarSumula(Long id, int placarMandante, int placarVisitante, String relato) {
        Sumula sumula = exigirPorId(id);

        if (sumula.isAssinada()) {
            throw new IllegalStateException("Esta súmula já foi encerrada.");
        }

        sumula.finalizarSumula(placarMandante, placarVisitante, relato);
        return sumulaRepository.save(sumula);
    }
    
    public Sumula adicionarOcorrencia(Long id, String evento) {
        if (exigirPorId(id).isAssinada()) {
            throw new IllegalStateException(
                    "Esta súmula já foi encerrada e não aceita novas ocorrências.");
        }
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
