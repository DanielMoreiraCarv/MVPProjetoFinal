package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Mapper.UsuarioMapper;
import org.example.Models.Request.PapeisRequest;
import org.example.Models.Request.RedefinicaoDeSenhaRequest;
import org.example.Models.Request.UsuarioCreateRequest;
import org.example.Models.Request.UsuarioUpdateRequest;
import org.example.Models.Response.UsuarioResponse;
import org.example.Seguranca.UsuarioAutenticado;
import org.example.Services.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Gestão de usuários. Toda rota daqui exige o papel ADMINISTRADOR. */
@RestController
@RequestMapping("/api/v1/usuario")
public class UsuarioController
{
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService)
    {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody UsuarioCreateRequest request)
    {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UsuarioMapper.toResponse(usuarioService.criar(request)));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar()
    {
        return ResponseEntity.ok(usuarioService.listarTodos().stream()
                .map(UsuarioMapper::toResponse)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id)
    {
        return ResponseEntity.ok(UsuarioMapper.toResponse(usuarioService.exigirPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest request,
            @AuthenticationPrincipal UsuarioAutenticado autenticado)
    {
        return ResponseEntity.ok(UsuarioMapper.toResponse(
                usuarioService.atualizar(id, request, autenticado.id())));
    }

    /** Substitui todos os papéis do usuário pelos enviados. */
    @PutMapping("/{id}/papel")
    public ResponseEntity<UsuarioResponse> definirPapeis(
            @PathVariable Long id,
            @Valid @RequestBody PapeisRequest request,
            @AuthenticationPrincipal UsuarioAutenticado autenticado)
    {
        return ResponseEntity.ok(UsuarioMapper.toResponse(
                usuarioService.definirPapeis(id, request.papeis(), autenticado.id())));
    }

    /** Para quem esqueceu a senha: o administrador define uma nova. */
    @PutMapping("/{id}/senha")
    public ResponseEntity<Void> redefinirSenha(
            @PathVariable Long id,
            @Valid @RequestBody RedefinicaoDeSenhaRequest request)
    {
        usuarioService.redefinirSenha(id, request.novaSenha());
        return ResponseEntity.noContent().build();
    }

    /** Desativa em vez de excluir, e encerra as sessões abertas. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioAutenticado autenticado)
    {
        usuarioService.desativar(id, autenticado.id());
        return ResponseEntity.noContent().build();
    }
}
