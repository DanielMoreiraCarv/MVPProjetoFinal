package org.example.Services;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Arbitro;
import org.example.Models.Competicao;
import org.example.Models.EnumFasePartida;
import org.example.Models.Equipe;
import org.example.Models.Fase;
import org.example.Models.Partida;
import org.example.Models.Request.PartidaAgendamentoRequest;
import org.example.Models.Request.PartidaCreateRequest;
import org.example.Models.Request.PartidaUpdateRequest;
import org.example.Repositories.ArbitroRepository;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.FaseRepository;
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

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private ArbitroRepository arbitroRepository;

    @Autowired
    private FaseRepository faseRepository;
    
    public Partida criarPartida(Partida partida) {
        partida.setId(null);
        return partidaRepository.save(partida);
    }

    /**
     * Cria a partida a partir dos ids do pedido.
     *
     * Antes o corpo da rota era a entidade JPA inteira, com equipe,
     * competição, fase e árbitro aninhados — quem chamava tinha que montar o
     * grafo do mapeamento para marcar um jogo.
     */
    public Partida criar(PartidaCreateRequest request) {
        Competicao competicao = competicaoRepository.findById(request.idCompeticao())
                .orElseThrow(() -> NaoEncontradoException.de("Competição", request.idCompeticao()));

        Equipe mandante = equipeRepository.findById(request.idEquipeMandante())
                .orElseThrow(() -> NaoEncontradoException.de("Equipe", request.idEquipeMandante()));

        Equipe visitante = equipeRepository.findById(request.idEquipeVisitante())
                .orElseThrow(() -> NaoEncontradoException.de("Equipe", request.idEquipeVisitante()));

        if (mandante.getId().equals(visitante.getId())) {
            throw new IllegalArgumentException("A equipe visitante deve ser diferente da mandante.");
        }

        exigirInscrita(competicao, mandante);
        exigirInscrita(competicao, visitante);

        Partida partida = new Partida();
        partida.setCompeticao(competicao);
        partida.setEquipeMandante(mandante);
        partida.setEquipeVisitante(visitante);
        partida.setDataHora(request.dataHora());
        partida.setLocal(request.local());

        if (request.idArbitro() != null) {
            partida.setArbitro(arbitroRepository.findById(request.idArbitro())
                    .orElseThrow(() -> NaoEncontradoException.de("Árbitro", request.idArbitro())));
        }

        if (request.idFase() != null) {
            Fase fase = faseRepository.findById(request.idFase())
                    .orElseThrow(() -> NaoEncontradoException.de("Fase", request.idFase()));
            partida.setFase(fase);
            partida.setEnumFasePartida(fase.getFasePartida());
        }

        return partidaRepository.save(partida);
    }

    /** Campo ausente no pedido é campo que não muda. */
    public Partida atualizar(Long id, PartidaUpdateRequest request) {
        Partida partida = exigirPorId(id);

        if (request.idCompeticao() != null) {
            partida.setCompeticao(competicaoRepository.findById(request.idCompeticao())
                    .orElseThrow(() -> NaoEncontradoException.de("Competição", request.idCompeticao())));
        }
        if (request.idEquipeMandante() != null) {
            partida.setEquipeMandante(equipeRepository.findById(request.idEquipeMandante())
                    .orElseThrow(() -> NaoEncontradoException.de("Equipe", request.idEquipeMandante())));
        }
        if (request.idEquipeVisitante() != null) {
            partida.setEquipeVisitante(equipeRepository.findById(request.idEquipeVisitante())
                    .orElseThrow(() -> NaoEncontradoException.de("Equipe", request.idEquipeVisitante())));
        }
        if (request.idArbitro() != null) {
            partida.setArbitro(arbitroRepository.findById(request.idArbitro())
                    .orElseThrow(() -> NaoEncontradoException.de("Árbitro", request.idArbitro())));
        }
        if (request.placarMandante() != null) {
            partida.setPlacarMandante(request.placarMandante());
        }
        if (request.placarVisitante() != null) {
            partida.setPlacarVisitante(request.placarVisitante());
        }
        if (request.dataHora() != null) {
            partida.setDataHora(request.dataHora());
        }
        if (request.local() != null) {
            partida.setLocal(request.local());
        }

        if (partida.getEquipeMandante() != null && partida.getEquipeVisitante() != null
                && partida.getEquipeMandante().getId().equals(partida.getEquipeVisitante().getId())) {
            throw new IllegalArgumentException("A equipe visitante deve ser diferente da mandante.");
        }

        return partidaRepository.save(partida);
    }

    /** Marcar dia, hora e lugar (RF58). */
    public Partida agendar(Long id, PartidaAgendamentoRequest request) {
        Partida partida = exigirPorId(id);
        partida.setDataHora(request.dataHora());
        partida.setLocal(request.local());
        return partidaRepository.save(partida);
    }

    public Partida exigirPorId(Long id) {
        return partidaRepository.findById(id)
                .orElseThrow(() -> NaoEncontradoException.de("Partida", id));
    }

    /**
     * Uma partida é entre equipes inscritas na competição. Sem esta checagem
     * dá para marcar um jogo entre duas equipes que não disputam o certame, e
     * a classificação passa a somar pontos para quem não está na tabela.
     */
    private void exigirInscrita(Competicao competicao, Equipe equipe) {
        boolean inscrita = competicao.getLstEquipes() != null
                && competicao.getLstEquipes().stream()
                        .anyMatch(e -> e.getId().equals(equipe.getId()));

        if (!inscrita) {
            throw new IllegalArgumentException(
                    "A equipe " + equipe.getNome() + " não está inscrita em "
                            + competicao.getNome() + ".");
        }
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
    
    /**
     * Escala o árbitro e grava o contador dele.
     *
     * `registrarTrabalho()` era chamado no controller e o Arbitro nunca era
     * salvo fora do cascade, então `partidasApitadas` só subia por acaso.
     */
    public Partida escalarArbitro(Long id, Arbitro arbitro) {
        Partida partida = exigirPorId(id);
        partida.setArbitro(arbitro);
        arbitro.registrarTrabalho();
        arbitroRepository.save(arbitro);
        return partidaRepository.save(partida);
    }

    public void deletarPartida(Long id) {
        partidaRepository.deleteById(id);
    }
}
