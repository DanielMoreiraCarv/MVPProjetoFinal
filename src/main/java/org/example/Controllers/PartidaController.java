package org.example.Controllers;

import org.example.Models.Arbitro;
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
@RequestMapping("/api/partidas")
@CrossOrigin(origins = "*")
public class PartidaController {

    @Autowired
    private PartidaService partidaService;

    @Autowired
    private ArbitroService arbitroService;

    @Autowired
    private SumulaService sumulaService;

    @PostMapping
    public ResponseEntity<Partida> criar(@RequestBody Partida partida) {
        try {
            Partida nova = partidaService.criarPartida(partida);
            return ResponseEntity.status(HttpStatus.CREATED).body(nova);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partida> buscarPorId(@PathVariable Long id) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida != null) {
            return ResponseEntity.ok(partida);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Partida>> listarTodas() {
        List<Partida> partidas = partidaService.listarTodas();
        return ResponseEntity.ok(partidas);
    }

    @GetMapping("/status/pendentes")
    public ResponseEntity<List<Partida>> listarPendentes() {
        List<Partida> partidas = partidaService.listarPendentes();
        return ResponseEntity.ok(partidas);
    }

    @GetMapping("/status/realizadas")
    public ResponseEntity<List<Partida>> listarRealizadas() {
        List<Partida> partidas = partidaService.listarRealizadas();
        return ResponseEntity.ok(partidas);
    }

    @GetMapping("/campeonato/{idCampeonato}")
    public ResponseEntity<List<Partida>> listarPorCampeonato(@PathVariable Long idCampeonato) {
        List<Partida> partidas = partidaService.listarPorCampeonato(idCampeonato);
        return ResponseEntity.ok(partidas);
    }

    @GetMapping("/time/{idTime}")
    public ResponseEntity<List<Partida>> listarPartidasDoTime(@PathVariable Long idTime) {
        List<Partida> partidas = partidaService.listarPartidasDoTime(idTime);
        return ResponseEntity.ok(partidas);
    }

    @GetMapping("/vitoria/{idTime}")
    public ResponseEntity<List<Partida>> listarVitorias(@PathVariable Long idTime) {
        List<Partida> partidas = partidaService.listarVitoriasDo(idTime);
        return ResponseEntity.ok(partidas);
    }

    @PutMapping("/{id}/escalar-arbitro")
    public ResponseEntity<Partida> escalarArbitro(@PathVariable Long id, @RequestParam Long idArbitro) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida == null) {
            return ResponseEntity.notFound().build();
        }
        if (partida.isRealizada()) {
            return ResponseEntity.badRequest().build();
        }
        Arbitro arbitro = arbitroService.buscarPorId(idArbitro);
        if (arbitro == null) {
            return ResponseEntity.notFound().build();
        }
        partida.setArbitro(arbitro);
        arbitro.registrarTrabalho();
        Partida atualizada = partidaService.atualizarPartida(id, partida);
        return ResponseEntity.ok(atualizada);
    }

    @PutMapping("/{id}/placar")
    public ResponseEntity<Partida> atualizarPlacar(
            @PathVariable Long id,
            @RequestParam int golsMandante,
            @RequestParam int golsVisitante) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida == null) {
            return ResponseEntity.notFound().build();
        }
        if (partida.isRealizada()) {
            return ResponseEntity.badRequest().build();
        }
        partida.setResultadoMandante(golsMandante);
        partida.setResultadoVisitante(golsVisitante);
        Partida atualizada = partidaService.atualizarPartida(id, partida);
        return ResponseEntity.ok(atualizada);
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Partida> finalizarPartida(@PathVariable Long id) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida == null) {
            return ResponseEntity.notFound().build();
        }
        if (partida.isRealizada()) {
            return ResponseEntity.badRequest().build();
        }
        Partida finalizada = partidaService.definirResultado(
                id,
                partida.getResultadoMandante(),
                partida.getResultadoVisitante()
        );
        return ResponseEntity.ok(finalizada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partida> atualizar(@PathVariable Long id, @RequestBody Partida partidaAtualizada) {
        Partida atualizada = partidaService.atualizarPartida(id, partidaAtualizada);
        if (atualizada != null) {
            return ResponseEntity.ok(atualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Partida partida = partidaService.buscarPorId(id);
        if (partida != null) {
            partidaService.deletarPartida(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}