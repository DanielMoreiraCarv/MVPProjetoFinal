package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Exception.NaoEncontradoException;
import org.example.Mapper.SumulaMapper;
import org.example.Models.Request.SumulaCreateRequest;
import org.example.Models.Request.SumulaFinalizacaoRequest;
import org.example.Models.Request.SumulaUpdateRequest;
import org.example.Models.Response.SumulaResponse;
import org.example.Models.Sumula;
import org.example.Services.SumulaService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Toda rota daqui fala `SumulaResponse`, pelo mesmo motivo da partida: a
 * entidade `Sumula` referencia `Partida`, que referencia a súmula de volta.
 */
@RestController
@RequestMapping("/api/v1/sumula")
public class SumulaController
{
    @Autowired
    private SumulaService sumulaService;

    @PostMapping
    public ResponseEntity<SumulaResponse> criar(@Valid @RequestBody SumulaCreateRequest request)
    {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SumulaMapper.toResponse(sumulaService.criar(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SumulaResponse> buscarPorId(@PathVariable Long id)
    {
        return ResponseEntity.ok(SumulaMapper.toResponse(sumulaService.exigirPorId(id)));
    }

    /** `?assinada=true|false` filtra; sem o parâmetro, traz todas. */
    @GetMapping
    public ResponseEntity<List<SumulaResponse>> listar(
            @RequestParam(required = false) Boolean assinada)
    {
        if (assinada == null)
        {
            return ResponseEntity.ok(SumulaMapper.toResponse(sumulaService.listarTodas()));
        }

        return ResponseEntity.ok(SumulaMapper.toResponse(
                assinada ? sumulaService.listarAssinadas() : sumulaService.listarPendentes()));
    }

    @GetMapping("/partida/{idPartida}")
    public ResponseEntity<SumulaResponse> buscarPorPartida(@PathVariable Long idPartida)
    {
        Sumula sumula = sumulaService.buscarPorPartida(idPartida);

        if (sumula == null)
        {
            throw new NaoEncontradoException(
                    "A partida " + idPartida + " ainda não tem súmula.");
        }

        return ResponseEntity.ok(SumulaMapper.toResponse(sumula));
    }

    @GetMapping("/arbitro/{idArbitro}")
    public ResponseEntity<List<SumulaResponse>> listarPorArbitro(@PathVariable Long idArbitro)
    {
        return ResponseEntity.ok(
                SumulaMapper.toResponse(sumulaService.listarPorArbitro(idArbitro)));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<SumulaResponse> finalizar(
            @PathVariable Long id,
            @Valid @RequestBody SumulaFinalizacaoRequest request)
    {
        return ResponseEntity.ok(SumulaMapper.toResponse(sumulaService.finalizarSumula(
                id, request.placarMandante(), request.placarVisitante(), request.observacoes())));
    }

    /**
     * Ocorrência é texto livre, e é esse o limite: sem a entidade `Evento` não
     * dá para derivar artilharia, cartão nem suspensão daqui (RF73, RF76).
     */
    @PostMapping("/{id}/ocorrencia")
    public ResponseEntity<SumulaResponse> adicionarOcorrencia(
            @PathVariable Long id,
            @RequestBody String ocorrencia)
    {
        if (ocorrencia == null || ocorrencia.isBlank())
        {
            throw new IllegalArgumentException("A ocorrência não pode ser vazia.");
        }

        return ResponseEntity.ok(
                SumulaMapper.toResponse(sumulaService.adicionarOcorrencia(id, ocorrencia)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SumulaResponse> atualizar(
            @PathVariable Long id,
            @RequestBody SumulaUpdateRequest request)
    {
        return ResponseEntity.ok(SumulaMapper.toResponse(sumulaService.atualizar(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id)
    {
        sumulaService.exigirPorId(id);
        sumulaService.deletarSumula(id);
        return ResponseEntity.noContent().build();
    }
}
