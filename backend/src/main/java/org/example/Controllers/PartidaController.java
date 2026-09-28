package org.example.Controllers;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Arbitro;
import org.example.Mapper.PartidaMapper;
import org.example.Models.Response.PartidaResponse;
import org.example.Models.Partida;
import org.example.Services.ArbitroService;
import org.example.Services.PartidaService;
import org.example.Services.SumulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/partida")
public class PartidaController {

    @Autowired
    private PartidaService partidaService;

    @Autowired
    private ArbitroService arbitroService;

    @Autowired
    private SumulaService sumulaService;

    @PostMapping
    public ResponseEntity<Partida> criar(@RequestBody Partida partida) {
        Partida nova = partidaService.criarPartida(partida);
        return ResponseEntity.status(HttpStatus.CREATED).body(nova);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartidaResponse> buscarPorId(@PathVariable Long id) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida != null) {
            return ResponseEntity.ok(PartidaMapper.toResponse(partida));
        }
        throw NaoEncontradoException.de( "Partida", id );
    }

    @GetMapping
    public ResponseEntity<List<PartidaResponse>> listarTodas() {
        return ResponseEntity.ok(
                partidaService.listarTodas().stream()
                              .map(PartidaMapper::toResponse)
                              .toList());
    }

    @GetMapping("/acompanhamento/{status}")
    public ResponseEntity<List<Partida>> listarPendentes(@PathVariable("status") String status) {
        if(status.equals("PENDENTE")) {
            List<Partida> partidas = partidaService.listarPendentes();
            return ResponseEntity.ok(partidas);
        } else if ( status.equals( "realizadas" ) ){
            List<Partida> partidas = partidaService.listarPendentes();
            return ResponseEntity.ok(partidas);
        }else
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

    }

    @GetMapping("/competicao/{idCompeticao}")
    public ResponseEntity<List<PartidaResponse>> listarPorCompeticao(@PathVariable Long idCompeticao) {
        return ResponseEntity.ok(
                partidaService.listarPorCompeticao(idCompeticao).stream()
                              .map(PartidaMapper::toResponse)
                              .toList());
    }

    @GetMapping("/equipe/{idTime}")
    public ResponseEntity<List<PartidaResponse>> listarPartidasDoTime(@PathVariable Long idEquipe) {
        return ResponseEntity.ok(
                partidaService.listarPartidasDoTime(idEquipe).stream()
                              .map(PartidaMapper::toResponse)
                              .toList());
    }

    @PutMapping("/{id}/escalar-arbitro")
    public ResponseEntity<Partida> escalarArbitro(@PathVariable Long id, @RequestParam Long idArbitro) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida == null) {
            throw NaoEncontradoException.de( "Partida", id );
        }
        if (partida.isRealizada()) {
            return ResponseEntity.badRequest().build();
        }
        Arbitro arbitro = arbitroService.buscarPorId(idArbitro);
        if (arbitro == null) {
            throw NaoEncontradoException.de( "Partida", id );
        }
        partida.setArbitro(arbitro);
        arbitro.registrarTrabalho();
        Partida atualizada = partidaService.atualizarPartida(id, partida);
        return ResponseEntity.ok(atualizada);
    }

    @PutMapping("/{id}/placar")
    public ResponseEntity<Partida> atualizarPlacar(
            @PathVariable Long id,
            @RequestParam int placarMandante,
            @RequestParam int placarVisitante) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida == null) {
            throw NaoEncontradoException.de( "Partida", id );
        }
        if (partida.isRealizada()) {
            return ResponseEntity.badRequest().build();
        }
        partida.setPlacarMandante(placarMandante);
        partida.setPlacarVisitante(placarVisitante);
        Partida atualizada = partidaService.atualizarPartida(id, partida);
        return ResponseEntity.ok(atualizada);
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Partida> finalizarPartida(@PathVariable Long id) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida == null) {
            throw NaoEncontradoException.de( "Partida", id );
        }
        if (partida.isRealizada()) {
            return ResponseEntity.badRequest().build();
        }
        Partida finalizada = partidaService.definirResultado(
                id,
                partida.getPlacarMandante(),
                partida.getPlacarVisitante()
        );
        return ResponseEntity.ok(finalizada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partida> atualizar(@PathVariable Long id, @RequestBody Partida partidaAtualizada) {
        Partida atualizada = partidaService.atualizarPartida(id, partidaAtualizada);
        if (atualizada != null) {
            return ResponseEntity.ok(atualizada);
        }
        throw NaoEncontradoException.de( "Partida", id );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida != null) {
            partidaService.deletarPartida(id);
            return ResponseEntity.noContent().build();
        }
        throw NaoEncontradoException.de( "Partida", id );
    }

}