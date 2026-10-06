package org.example.Services;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Atleta;
import org.example.Models.EnumModoDaSumula;
import org.example.Models.EnumTipoDeEvento;
import org.example.Models.Equipe;
import org.example.Models.EventoDaSumula;
import org.example.Models.Partida;
import org.example.Models.Request.SumulaCreateRequest;
import org.example.Models.Request.SumulaUpdateRequest;
import org.example.Repositories.ArbitroRepository;
import org.example.Repositories.AtletaRepository;
import org.example.Models.Sumula;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.SumulaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;

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

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private PartidaService partidaService;

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

        if (request.modo() != null) {
            sumula.setModo(modoDe(request.modo()));
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
        if (request.placarMandante() != null || request.placarVisitante() != null) {
            int mandante = request.placarMandante() != null ? request.placarMandante() : sumula.getPlacarMandante();
            int visitante = request.placarVisitante() != null ? request.placarVisitante() : sumula.getPlacarVisitante();
            definirPlacar(sumula, mandante, visitante);
        }
        if (request.observacoes() != null) {
            sumula.setObservacoesRelatadas(request.observacoes());
        }
        if (request.modo() != null) {
            sumula.setModo(modoDe(request.modo()));
        }

        return sumulaRepository.save(sumula);
    }
    
    public Sumula finalizarSumula(Long id, int placarMandante, int placarVisitante, String relato) {
        Sumula sumula = exigirPorId(id);

        if (sumula.isAssinada()) {
            throw new IllegalStateException("Esta súmula já foi encerrada.");
        }

        definirPlacar(sumula, placarMandante, placarVisitante);
        sumula.finalizarSumula(placarMandante, placarVisitante, relato);
        Sumula assinada = sumulaRepository.save(sumula);

        // A súmula assinada é o registro oficial do jogo: a partida termina com
        // o placar dela. Antes as duas tinham placares independentes, e
        // assinar a súmula não mudava nada na classificação.
        Partida partida = assinada.getPartida();
        if (partida != null && !partida.isRealizada()) {
            partidaService.definirResultado(partida.getId(), placarMandante, placarVisitante);
        }
        return assinada;
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
    
    /**
     * O que um atleta fez. Gol mexe no placar da equipe dele, gol contra no do
     * adversário, e o segundo amarelo traz o vermelho junto (RF77).
     */
    @Transactional
    public Sumula registrarEvento(Long id, Long idAtleta, String codigoDoTipo) {
        Sumula sumula = exigirAberta(id);
        EnumTipoDeEvento tipo = tipoDe(codigoDoTipo);
        Atleta atleta = atletaRepository.findById(idAtleta)
                .orElseThrow(() -> NaoEncontradoException.de("Atleta", idAtleta));
        Equipe equipe = equipeDaPartida(sumula.getPartida(), atleta);

        sumula.getEventos().add(new EventoDaSumula(sumula, atleta, equipe, tipo, false));

        if (tipo.ehGol()) {
            boolean doMandante = favoreceMandante(sumula.getPartida(), equipe, tipo);
            sincronizar(sumula,
                    sumula.getPlacarMandante() + (doMandante ? 1 : 0),
                    sumula.getPlacarVisitante() + (doMandante ? 0 : 1));
        }

        if (tipo == EnumTipoDeEvento.CARTAO_AMARELO
                && contar(sumula, atleta, EnumTipoDeEvento.CARTAO_AMARELO) == 2
                && contar(sumula, atleta, EnumTipoDeEvento.CARTAO_VERMELHO_INDIRETO) == 0) {
            sumula.getEventos().add(new EventoDaSumula(
                    sumula, atleta, equipe, EnumTipoDeEvento.CARTAO_VERMELHO_INDIRETO, true));
        }

        return sumulaRepository.save(sumula);
    }

    /** Desfaz um lançamento, e o que ele causou: o gol no placar, o vermelho do segundo amarelo. */
    @Transactional
    public Sumula removerEvento(Long id, Long idEvento) {
        Sumula sumula = exigirAberta(id);
        EventoDaSumula evento = sumula.getEventos().stream()
                .filter(cada -> cada.getId().equals(idEvento))
                .findFirst()
                .orElseThrow(() -> NaoEncontradoException.de("Evento da súmula", idEvento));

        sumula.getEventos().remove(evento);

        if (evento.getTipo().ehGol()) {
            boolean doMandante = favoreceMandante(sumula.getPartida(), evento.getEquipe(), evento.getTipo());
            sincronizar(sumula,
                    Math.max(0, sumula.getPlacarMandante() - (doMandante ? 1 : 0)),
                    Math.max(0, sumula.getPlacarVisitante() - (doMandante ? 0 : 1)));
        }

        if (evento.getTipo() == EnumTipoDeEvento.CARTAO_AMARELO
                && contar(sumula, evento.getAtleta(), EnumTipoDeEvento.CARTAO_AMARELO) < 2) {
            sumula.getEventos().removeIf(cada -> cada.isAutomatico()
                    && cada.getTipo() == EnumTipoDeEvento.CARTAO_VERMELHO_INDIRETO
                    && cada.getAtleta().getId().equals(evento.getAtleta().getId()));
        }

        return sumulaRepository.save(sumula);
    }

    private Sumula exigirAberta(Long id) {
        Sumula sumula = exigirPorId(id);
        if (sumula.isAssinada()) {
            throw new IllegalStateException("Esta súmula já foi assinada e não aceita alteração.");
        }
        return sumula;
    }

    /**
     * O placar pode ficar acima dos gols lançados — o gol de que ninguém sabe
     * o autor —, nunca abaixo: aí a súmula diria que alguém marcou um gol que
     * não entrou.
     */
    private void definirPlacar(Sumula sumula, int mandante, int visitante) {
        if (mandante < 0 || visitante < 0) {
            throw new IllegalArgumentException("O placar não pode ser negativo.");
        }
        int doMandante = golsComAutor(sumula, true);
        int doVisitante = golsComAutor(sumula, false);
        if (mandante < doMandante || visitante < doVisitante) {
            boolean faltaNoMandante = mandante < doMandante;
            int lancados = faltaNoMandante ? doMandante : doVisitante;
            throw new IllegalArgumentException("O placar não pode ficar abaixo dos " + lancados
                    + (lancados == 1 ? " gol com autor" : " gols com autor") + " já lançados para "
                    + nomeDoLado(sumula.getPartida(), faltaNoMandante)
                    + ". Remova o gol do atleta antes de baixar o placar.");
        }
        sincronizar(sumula, mandante, visitante);
    }

    /** O placar da partida acompanha o da súmula enquanto o jogo não termina. */
    private void sincronizar(Sumula sumula, int mandante, int visitante) {
        sumula.setPlacarMandante(mandante);
        sumula.setPlacarVisitante(visitante);

        Partida partida = sumula.getPartida();
        if (partida != null && !partida.isRealizada()) {
            partida.setPlacarMandante(mandante);
            partida.setPlacarVisitante(visitante);
            partidaRepository.save(partida);
        }
    }

    private int golsComAutor(Sumula sumula, boolean paraOMandante) {
        return (int) sumula.getEventos().stream()
                .filter(evento -> evento.getTipo().ehGol())
                .filter(evento -> favoreceMandante(sumula.getPartida(), evento.getEquipe(), evento.getTipo())
                        == paraOMandante)
                .count();
    }

    private static boolean favoreceMandante(Partida partida, Equipe equipe, EnumTipoDeEvento tipo) {
        boolean ehDoMandante = Objects.equals(equipe.getId(), partida.getIdEquipeMandante());
        return tipo == EnumTipoDeEvento.GOL_CONTRA ? !ehDoMandante : ehDoMandante;
    }

    private static long contar(Sumula sumula, Atleta atleta, EnumTipoDeEvento tipo) {
        return sumula.getEventos().stream()
                .filter(evento -> evento.getTipo() == tipo)
                .filter(evento -> evento.getAtleta().getId().equals(atleta.getId()))
                .count();
    }

    private static Equipe equipeDaPartida(Partida partida, Atleta atleta) {
        Equipe equipe = atleta.getEquipe();
        if (partida == null || equipe == null
                || !(equipe.getId().equals(partida.getIdEquipeMandante())
                     || equipe.getId().equals(partida.getIdEquipeVisitante()))) {
            throw new IllegalArgumentException(
                    atleta.getNome() + " não joga esta partida: não é do elenco de nenhuma das duas equipes.");
        }
        return equipe;
    }

    private static String nomeDoLado(Partida partida, boolean mandante) {
        Equipe equipe = mandante ? partida.getEquipeMandante() : partida.getEquipeVisitante();
        return equipe == null ? (mandante ? "o mandante" : "o visitante") : equipe.getNome();
    }

    private static EnumTipoDeEvento tipoDe(String codigo) {
        return Arrays.stream(EnumTipoDeEvento.values())
                .filter(tipo -> tipo.name().equals(codigo))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tipo de evento \"" + codigo
                        + "\" não existe. Use um de: " + Arrays.stream(EnumTipoDeEvento.values())
                        .map(Enum::name).collect(Collectors.joining(", ")) + "."));
    }

    private static EnumModoDaSumula modoDe(String codigo) {
        return Arrays.stream(EnumModoDaSumula.values())
                .filter(modo -> modo.name().equals(codigo))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Modo de súmula \"" + codigo + "\" não existe. Use SIMPLIFICADA ou COMPLETA."));
    }

    /**
     * A partida segura a súmula com cascata: apagar só pelo repositório
     * respondia 204, e no flush a cascata da partida — que ainda a
     * referenciava — persistia a súmula de novo. Solta-se a partida antes.
     */
    @Transactional
    public void deletarSumula(Long id) {
        Sumula sumula = exigirPorId(id);
        Partida partida = sumula.getPartida();
        if (partida != null) {
            partida.vincularSumula(null);
            partidaRepository.save(partida);
        }
        sumulaRepository.delete(sumula);
    }
}
