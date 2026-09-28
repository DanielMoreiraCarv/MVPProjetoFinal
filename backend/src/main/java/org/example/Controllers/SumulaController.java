package org.example.Controllers;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Sumula;
import org.example.Services.PartidaService;
import org.example.Services.SumulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sumula")
public class SumulaController {

    @Autowired
    private SumulaService sumulaService;

    @Autowired
    private PartidaService partidaService;

    @PostMapping
    public ResponseEntity<Sumula> criar(@RequestParam Long idPartida, @RequestBody Sumula sumula) {
        Sumula nova = sumulaService.criarSumula(idPartida, sumula);
        return ResponseEntity.status(HttpStatus.CREATED).body(nova);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sumula> buscarPorId(@PathVariable Long id) {
        Sumula sumula = sumulaService.buscarPorId(id);
        if (sumula != null) {
            return ResponseEntity.ok(sumula);
        }
        throw NaoEncontradoException.de( "Súmula", id );
    }

    @GetMapping
    public ResponseEntity<List<Sumula>> listarTodas() {
        List<Sumula> sumulas = sumulaService.listarTodas();
        return ResponseEntity.ok(sumulas);
    }

    @GetMapping("/status/assinadas")
    public ResponseEntity<List<Sumula>> listarAssinadas() {
        List<Sumula> sumulas = sumulaService.listarAssinadas();
        return ResponseEntity.ok(sumulas);
    }

    @GetMapping("/status/pendentes")
    public ResponseEntity<List<Sumula>> listarPendentes() {
        List<Sumula> sumulas = sumulaService.listarPendentes();
        return ResponseEntity.ok(sumulas);
    }

    @GetMapping("/partida/{idPartida}")
    public ResponseEntity<Sumula> buscarPorPartida(@PathVariable Long idPartida) {
        Sumula sumula = sumulaService.buscarPorPartida(idPartida);
        if (sumula != null) {
            return ResponseEntity.ok(sumula);
        }
        throw NaoEncontradoException.de( "Súmula", idPartida );
    }

    @GetMapping("/arbitro/{idArbitro}")
    public ResponseEntity<List<Sumula>> listarPorArbitro(@PathVariable Long idArbitro) {
        List<Sumula> sumulas = sumulaService.listarPorArbitro(idArbitro);
        return ResponseEntity.ok(sumulas);
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Sumula> finalizarSumula(
            @PathVariable Long id,
            @RequestParam int placarMandante,
            @RequestParam int placarVisitante,
            @RequestParam String relato) {
        Sumula finalizada = sumulaService.finalizarSumula(id, placarMandante, placarVisitante, relato);
        if (finalizada != null) {
            return ResponseEntity.ok(finalizada);
        }
        throw NaoEncontradoException.de( "Súmula", id );
    }

    @PostMapping("/{id}/ocorrencia")
    public ResponseEntity<Sumula> adicionarOcorrencia(
            @PathVariable Long id,
            @RequestParam String evento) {
        Sumula atualizada = sumulaService.adicionarOcorrencia(id, evento);
        if (atualizada != null) {
            return ResponseEntity.ok(atualizada);
        }
        throw NaoEncontradoException.de( "Súmula", id );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sumula> atualizar(@PathVariable Long id, @RequestBody Sumula sumulaAtualizada) {
        Sumula atualizada = sumulaService.atualizarSumula(id, sumulaAtualizada);
        if (atualizada != null) {
            return ResponseEntity.ok(atualizada);
        }
        throw NaoEncontradoException.de( "Súmula", id );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Sumula sumula = sumulaService.buscarPorId(id);
        if (sumula != null) {
            sumulaService.deletarSumula(id);
            return ResponseEntity.noContent().build();
        }
        throw NaoEncontradoException.de( "Súmula", id );
    }
}