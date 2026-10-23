package org.example.Controllers;

import org.example.Mapper.UsuarioMapper;
import org.example.Models.Response.PapelResponse;
import org.example.Services.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** O catálogo de papéis, para a tela de usuários montar a escolha. */
@RestController
@RequestMapping("/api/v1/papel")
public class PapelController
{
    private final UsuarioService usuarioService;

    public PapelController(UsuarioService usuarioService)
    {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<PapelResponse>> listar()
    {
        return ResponseEntity.ok(usuarioService.listarPapeis().stream()
                .map(UsuarioMapper::toResponse)
                .toList());
    }
}
