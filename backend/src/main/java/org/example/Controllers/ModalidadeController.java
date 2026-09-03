package org.example.Controllers;

import org.example.Models.Modalidade;
import org.example.Services.ModalidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/modalidade")
@CrossOrigin(origins = "*")
public class ModalidadeController {

    @Autowired
    private ModalidadeService modalidadeService;

    @GetMapping
    public ResponseEntity<List<Modalidade>> listar() {
        return ResponseEntity.ok(modalidadeService.listarAtivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Modalidade> buscarPorId(@PathVariable Long id) {
        Modalidade modalidade = modalidadeService.buscarPorId(id);
        if (modalidade != null) {
            return ResponseEntity.ok(modalidade);
        }
        return ResponseEntity.notFound().build();
    }
}
