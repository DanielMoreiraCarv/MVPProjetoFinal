package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Models.Request.ConviteRequest;
import org.example.Models.Response.PessoasDaCompeticaoResponse;
import org.example.Services.PessoasDaCompeticaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Compartilhar a competição com outras pessoas. A porta já conferiu que
 * quem pede participa dela; quem participa pode convidar e remover.
 */
@RestController
@RequestMapping("/api/v1/competicao/{id}/pessoas")
public class PessoasDaCompeticaoController
{
    private final PessoasDaCompeticaoService pessoas;

    public PessoasDaCompeticaoController(PessoasDaCompeticaoService pessoas)
    {
        this.pessoas = pessoas;
    }

    @GetMapping
    public ResponseEntity<PessoasDaCompeticaoResponse> listar(@PathVariable Long id)
    {
        return ResponseEntity.ok(pessoas.listar(id));
    }

    @PostMapping
    public ResponseEntity<PessoasDaCompeticaoResponse> convidar(@PathVariable Long id,
                                                                @Valid @RequestBody ConviteRequest request)
    {
        return ResponseEntity.ok(pessoas.convidar(id, request.email()));
    }

    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<PessoasDaCompeticaoResponse> remover(@PathVariable Long id, @PathVariable Long idUsuario)
    {
        return ResponseEntity.ok(pessoas.remover(id, idUsuario));
    }

    @DeleteMapping("/convite/{idConvite}")
    public ResponseEntity<PessoasDaCompeticaoResponse> cancelarConvite(@PathVariable Long id,
                                                                       @PathVariable Long idConvite)
    {
        return ResponseEntity.ok(pessoas.cancelarConvite(id, idConvite));
    }
}
