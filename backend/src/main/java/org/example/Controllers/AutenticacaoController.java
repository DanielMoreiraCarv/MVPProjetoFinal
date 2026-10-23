package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Mapper.UsuarioMapper;
import org.example.Models.Request.AlteracaoDeSenhaRequest;
import org.example.Models.Request.CadastroRequest;
import org.example.Models.Request.LoginRequest;
import org.example.Models.Request.PerfilUpdateRequest;
import org.example.Models.Request.RenovacaoRequest;
import org.example.Models.Response.AutenticacaoResponse;
import org.example.Models.Response.UsuarioResponse;
import org.example.Seguranca.UsuarioAutenticado;
import org.example.Services.AutenticacaoService;
import org.example.Services.SessaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A conta de quem está usando: entrar, sair, renovar a sessão, ver e editar o
 * próprio perfil, trocar a senha.
 *
 * login, cadastro, renovar e sair são públicas; as demais exigem o token de
 * acesso no cabeçalho `Authorization: Bearer …`.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AutenticacaoController
{
    private final AutenticacaoService autenticacaoService;
    private final SessaoService sessaoService;

    public AutenticacaoController(AutenticacaoService autenticacaoService, SessaoService sessaoService)
    {
        this.autenticacaoService = autenticacaoService;
        this.sessaoService = sessaoService;
    }

    @PostMapping("/login")
    public ResponseEntity<AutenticacaoResponse> entrar(@Valid @RequestBody LoginRequest request)
    {
        return ResponseEntity.ok(autenticacaoService.entrar(request));
    }

    @PostMapping("/cadastro")
    public ResponseEntity<AutenticacaoResponse> cadastrar(@Valid @RequestBody CadastroRequest request)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(autenticacaoService.cadastrar(request));
    }

    @PostMapping("/renovar")
    public ResponseEntity<AutenticacaoResponse> renovar(@Valid @RequestBody RenovacaoRequest request)
    {
        return ResponseEntity.ok(sessaoService.renovar(request.tokenRenovacao()));
    }

    /**
     * Revoga o token de renovação. O de acesso continua valendo até vencer
     * (minutos): o cliente deve descartá-lo junto.
     */
    @PostMapping("/sair")
    public ResponseEntity<Void> sair(@Valid @RequestBody RenovacaoRequest request)
    {
        sessaoService.encerrar(request.tokenRenovacao());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/eu")
    public ResponseEntity<UsuarioResponse> eu(@AuthenticationPrincipal UsuarioAutenticado autenticado)
    {
        return ResponseEntity.ok(UsuarioMapper.toResponse(autenticacaoService.eu(autenticado.id())));
    }

    @PutMapping("/eu")
    public ResponseEntity<UsuarioResponse> atualizarPerfil(
            @AuthenticationPrincipal UsuarioAutenticado autenticado,
            @Valid @RequestBody PerfilUpdateRequest request)
    {
        return ResponseEntity.ok(UsuarioMapper.toResponse(
                autenticacaoService.atualizarPerfil(autenticado.id(), request)));
    }

    /** Devolve uma sessão nova: as anteriores, inclusive a atual, são encerradas. */
    @PutMapping("/senha")
    public ResponseEntity<AutenticacaoResponse> alterarSenha(
            @AuthenticationPrincipal UsuarioAutenticado autenticado,
            @Valid @RequestBody AlteracaoDeSenhaRequest request)
    {
        return ResponseEntity.ok(autenticacaoService.alterarSenha(autenticado.id(), request));
    }
}
