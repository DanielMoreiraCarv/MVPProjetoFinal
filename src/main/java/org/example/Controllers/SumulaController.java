package org.example.Controllers;

import org.example.Models.Sumula;
import org.example.Services.PartidaService;
import org.example.Services.SumulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sumulas")
@CrossOrigin(origins = "*")
public class SumulaController {

    @Autowired
    private SumulaService sumulaService;

    @Autowired
    private PartidaService partidaService;

    @PostMapping
    public ResponseEntity<Sumula> criar(@RequestBody Sumula sumula) {
        try {
            Sumula nova = sumulaService.criarSumula(sumula);
            return ResponseEntity.status(HttpStatus.CREATED).body(nova);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sumula> buscarPorId(@PathVariable Long id) {
        Sumula sumula = sumulaService.buscarPorId(id);
        if (sumula != null) {
            return ResponseEntity.ok(sumula);
        }
        return ResponseEntity.notFound().build();
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
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/arbitro/{idArbitro}")
    public ResponseEntity<List<Sumula>> listarPorArbitro(@PathVariable Long idArbitro) {
        List<Sumula> sumulas = sumulaService.listarPorArbitro(idArbitro);
        return ResponseEntity.ok(sumulas);
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Sumula> finalizarSumula(
            @PathVariable Long id,
            @RequestParam int golsMandante,
            @RequestParam int golsVisitante,
            @RequestParam String relato) {
        Sumula finalizada = sumulaService.finalizarSumula(id, golsMandante, golsVisitante, relato);
        if (finalizada != null) {
            return ResponseEntity.ok(finalizada);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/ocorrencia")
    public ResponseEntity<Sumula> adicionarOcorrencia(
            @PathVariable Long id,
            @RequestParam String evento) {
        Sumula atualizada = sumulaService.adicionarOcorrencia(id, evento);
        if (atualizada != null) {
            return ResponseEntity.ok(atualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sumula> atualizar(@PathVariable Long id, @RequestBody Sumula sumulaAtualizada) {
        Sumula atualizada = sumulaService.atualizarSumula(id, sumulaAtualizada);
        if (atualizada != null) {
            return ResponseEntity.ok(atualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Sumula sumula = sumulaService.buscarPorId(id);
        if (sumula != null) {
            sumulaService.deletarSumula(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}