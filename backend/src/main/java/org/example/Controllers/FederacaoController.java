package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Mapper.FederacaoMapper;
import org.example.Models.Federacao;
import org.example.Models.Request.FederacaoCreateRequest;
import org.example.Models.Request.FederacaoUpdateRequest;
import org.example.Models.Response.FederacaoResponse;
import org.example.Services.FederacaoService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * A federação já tinha entidade, repositório, mapper, DTOs e exceptions — e
 * nenhuma rota. Como `Equipe` referencia federação, não havia como cadastrar
 * uma equipe completa pela API.
 */
@RestController
@RequestMapping("/api/v1/federacao")
public class FederacaoController
{
    @Autowired
    private FederacaoService federacaoService;

    @PostMapping
    public ResponseEntity<FederacaoResponse> criar(
            @Valid @RequestBody FederacaoCreateRequest request)
    {
        Federacao federacao = federacaoService.criar(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FederacaoMapper.toResponse(federacao));
    }

    @GetMapping
    public ResponseEntity<List<FederacaoResponse>> listar()
    {
        return ResponseEntity.ok(federacaoService.listarTodas().stream()
                .map(FederacaoMapper::toResponse)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FederacaoResponse> buscarPorId(@PathVariable Long id)
    {
        return ResponseEntity.ok(FederacaoMapper.toResponse(federacaoService.exigirPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FederacaoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody FederacaoUpdateRequest request)
    {
        return ResponseEntity.ok(
                FederacaoMapper.toResponse(federacaoService.atualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id)
    {
        federacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
