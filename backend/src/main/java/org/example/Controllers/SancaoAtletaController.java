package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Exception.NaoEncontradoException;
import org.example.Mapper.SancaoAtletaMapper;
import org.example.Models.Request.SancaoAtletaRequest;
import org.example.Models.Response.SancaoAtletaResponse;
import org.example.Models.SancaoAtleta;
import org.example.Services.SancaoAtletaService;
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
 * A punição aplicada a um atleta.
 *
 * Morava dentro do controller de sanção, em `/sancao/sancao`, com a
 * inativação em `DELETE /sancao/inativar/{id}` ao lado de
 * `DELETE /sancao/deletar/{id}` — dois DELETE que faziam coisas diferentes,
 * e um deles não apagava nada.
 */
@RestController
@RequestMapping("/api/v1/sancao_atleta")
public class SancaoAtletaController
{
    @Autowired
    private SancaoAtletaService sancaoAtletaService;

    @PostMapping
    public ResponseEntity<SancaoAtletaResponse> criar(
            @Valid @RequestBody SancaoAtletaRequest request)
    {
        // Faltava o @RequestBody: sem ele o Spring tenta montar o record a
        // partir dos parâmetros da query, e o corpo JSON nunca era lido.
        SancaoAtleta sancaoAtleta = sancaoAtletaService.criarSancaoAtleta(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SancaoAtletaMapper.toResponse(sancaoAtleta));
    }

    @GetMapping
    public ResponseEntity<List<SancaoAtletaResponse>> listar()
    {
        return ResponseEntity.ok(sancaoAtletaService.findAll().stream()
                .map(SancaoAtletaMapper::toResponse)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SancaoAtletaResponse> buscarPorId(@PathVariable Long id)
    {
        SancaoAtleta sancaoAtleta = sancaoAtletaService.findById(id);

        if (sancaoAtleta == null)
        {
            throw NaoEncontradoException.de("Sanção do atleta", id);
        }

        return ResponseEntity.ok(SancaoAtletaMapper.toResponse(sancaoAtleta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SancaoAtletaResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody SancaoAtletaRequest request)
    {
        return ResponseEntity.ok(
                SancaoAtletaMapper.toResponse(sancaoAtletaService.update(request, id)));
    }

    /**
     * Encerra a suspensão sem apagar o registro.
     *
     * Era `DELETE /sancao/inativar/{id}`, que não apagava nada — mudar estado
     * é PUT, e usar DELETE para isso é o tipo de coisa que faz alguém chamar a
     * rota errada achando que está inativando.
     */
    @PutMapping("/{id}/inativar")
    public ResponseEntity<Void> inativar(@PathVariable Long id)
    {
        sancaoAtletaService.inativarSancaoAtleta(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id)
    {
        sancaoAtletaService.deleteSancaoAtleta(id);
        return ResponseEntity.noContent().build();
    }
}
