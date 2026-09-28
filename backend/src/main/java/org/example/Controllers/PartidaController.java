package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Exception.NaoEncontradoException;
import org.example.Mapper.PartidaMapper;
import org.example.Models.Arbitro;
import org.example.Models.Partida;
import org.example.Models.Request.PartidaAgendamentoRequest;
import org.example.Models.Request.PartidaCreateRequest;
import org.example.Models.Request.PartidaUpdateRequest;
import org.example.Models.Response.PartidaResponse;
import org.example.Services.ArbitroService;
import org.example.Services.PartidaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Toda rota daqui fala `PartidaResponse`.
 *
 * Metade delas devolvia a entidade `Partida` crua, e `Partida` tem `Sumula`,
 * que tem `Partida` de volta: a serialização entrava em recursão e a resposta
 * estourava. As que já devolviam DTO escapavam por acidente, não por desenho.
 */
@RestController
@RequestMapping("/api/v1/partida")
public class PartidaController
{
    @Autowired
    private PartidaService partidaService;

    @Autowired
    private ArbitroService arbitroService;

    @PostMapping
    public ResponseEntity<PartidaResponse> criar(@Valid @RequestBody PartidaCreateRequest request)
    {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PartidaMapper.toResponse(partidaService.criar(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartidaResponse> buscarPorId(@PathVariable Long id)
    {
        return ResponseEntity.ok(PartidaMapper.toResponse(partidaService.exigirPorId(id)));
    }

    @GetMapping
    public ResponseEntity<List<PartidaResponse>> listarTodas()
    {
        return ResponseEntity.ok(PartidaMapper.toResponse(partidaService.listarTodas()));
    }

    /**
     * `?realizada=true` traz as encerradas, `false` as que faltam, sem o
     * parâmetro traz todas.
     *
     * Substitui `/acompanhamento/{status}`, que aceitava "PENDENTE" e
     * "realizadas" — maiúsculas de um lado, minúsculas do outro — e devolvia
     * as pendentes nos dois casos: os dois ramos do `if` chamavam o mesmo
     * método.
     */
    @GetMapping("/acompanhamento")
    public ResponseEntity<List<PartidaResponse>> acompanhamento(
            @RequestParam(required = false) Boolean realizada)
    {
        if (realizada == null)
        {
            return ResponseEntity.ok(PartidaMapper.toResponse(partidaService.listarTodas()));
        }

        return ResponseEntity.ok(PartidaMapper.toResponse(
                realizada ? partidaService.listarRealizadas() : partidaService.listarPendentes()));
    }

    @GetMapping("/competicao/{idCompeticao}")
    public ResponseEntity<List<PartidaResponse>> listarPorCompeticao(
            @PathVariable Long idCompeticao)
    {
        return ResponseEntity.ok(
                PartidaMapper.toResponse(partidaService.listarPorCompeticao(idCompeticao)));
    }

    /**
     * O nome do parâmetro no caminho era `{idTime}` e o do método `idEquipe`,
     * sobra do renome de vocabulário: o Spring não conseguia ligar os dois e a
     * rota respondia 500 a qualquer chamada.
     */
    @GetMapping("/equipe/{idEquipe}")
    public ResponseEntity<List<PartidaResponse>> listarPorEquipe(@PathVariable Long idEquipe)
    {
        return ResponseEntity.ok(
                PartidaMapper.toResponse(partidaService.listarPartidasDoTime(idEquipe)));
    }

    @PutMapping("/{id}/escalar-arbitro")
    public ResponseEntity<PartidaResponse> escalarArbitro(
            @PathVariable Long id,
            @RequestParam Long idArbitro)
    {
        Partida partida = partidaService.exigirPorId(id);

        if (partida.isRealizada())
        {
            throw new IllegalArgumentException(
                    "A partida já foi encerrada e não aceita troca de árbitro.");
        }

        Arbitro arbitro = arbitroService.buscarPorId(idArbitro);
        if (arbitro == null)
        {
            // Antes isto lançava "Partida não encontrada" com o id da partida,
            // quando quem faltava era o árbitro.
            throw NaoEncontradoException.de("Árbitro", idArbitro);
        }

        return ResponseEntity.ok(
                PartidaMapper.toResponse(partidaService.escalarArbitro(id, arbitro)));
    }

    @PutMapping("/{id}/placar")
    public ResponseEntity<PartidaResponse> atualizarPlacar(
            @PathVariable Long id,
            @RequestParam int placarMandante,
            @RequestParam int placarVisitante)
    {
        Partida partida = partidaService.exigirPorId(id);

        if (partida.isRealizada())
        {
            throw new IllegalArgumentException(
                    "A partida já foi encerrada. Corrigir resultado encerrado é outra operação.");
        }

        if (placarMandante < 0 || placarVisitante < 0)
        {
            throw new IllegalArgumentException("O placar não pode ser negativo.");
        }

        partida.setPlacarMandante(placarMandante);
        partida.setPlacarVisitante(placarVisitante);

        return ResponseEntity.ok(
                PartidaMapper.toResponse(partidaService.atualizarPartida(id, partida)));
    }

    /** Marca dia, hora e lugar (RF58). */
    @PutMapping("/{id}/agendamento")
    public ResponseEntity<PartidaResponse> agendar(
            @PathVariable Long id,
            @Valid @RequestBody PartidaAgendamentoRequest request)
    {
        return ResponseEntity.ok(
                PartidaMapper.toResponse(partidaService.agendar(id, request)));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<PartidaResponse> finalizar(@PathVariable Long id)
    {
        Partida partida = partidaService.exigirPorId(id);

        if (partida.isRealizada())
        {
            throw new IllegalArgumentException("A partida já foi encerrada.");
        }

        Partida finalizada = partidaService.definirResultado(
                id, partida.getPlacarMandante(), partida.getPlacarVisitante());

        return ResponseEntity.ok(PartidaMapper.toResponse(finalizada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartidaResponse> atualizar(
            @PathVariable Long id,
            @RequestBody PartidaUpdateRequest request)
    {
        return ResponseEntity.ok(PartidaMapper.toResponse(partidaService.atualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id)
    {
        partidaService.exigirPorId(id);
        partidaService.deletarPartida(id);
        return ResponseEntity.noContent().build();
    }
}
