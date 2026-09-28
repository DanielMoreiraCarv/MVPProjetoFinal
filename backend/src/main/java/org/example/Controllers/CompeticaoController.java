package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Exception.CompeticaoCreateException;
import org.example.Exception.CompeticaoUpdateException;
import org.example.Mapper.CompeticaoMapper;
import org.example.Models.Competicao;
import org.example.Models.Request.CompeticaoCreateRequest;
import org.example.Models.Request.CompeticaoUpdateRequest;
import org.example.Models.Response.CompeticaoResponse;
import org.example.Services.CompeticaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

@RestController
@RequestMapping("/api/v1/competicao")
@CrossOrigin(origins = "*")
public class CompeticaoController
{
    @Autowired
    private CompeticaoService competicaoService;

    @PostMapping
    public ResponseEntity<CompeticaoResponse> criar (
            @Valid @RequestBody CompeticaoCreateRequest request
    )
    {
        try
        {
            Competicao competicao = competicaoService.criar(
                    CompeticaoMapper.toEntity( request )
            );

            return ResponseEntity
                    .status( HttpStatus.CREATED )
                    .body( CompeticaoMapper.toResponse( competicao ) );
        }
        catch ( CompeticaoCreateException e )
        {
            return ResponseEntity.status( HttpStatus.BAD_REQUEST ).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<CompeticaoResponse>> listar (
            @RequestParam(required = false) Long idAdministracao
    )
    {
        List<CompeticaoResponse> competicoes;

        if ( idAdministracao != null )
        {
            competicoes = CompeticaoMapper.toResponse(
                    competicaoService.listarPorAdministracao( idAdministracao )
            );
        }
        else
        {
            competicoes = CompeticaoMapper.toResponse(
                    competicaoService.listarTodos()
            );
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( competicoes );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompeticaoResponse> buscarPorId (
            @PathVariable Long id
    )
    {
        Competicao competicao = competicaoService.buscarPorId( id );

        if ( competicao == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( CompeticaoMapper.toResponse( competicao ) );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompeticaoResponse> atualizar (
            @PathVariable Long id,
            @Valid @RequestBody CompeticaoUpdateRequest request
    )
    {
        Competicao competicao = competicaoService.buscarPorId( id );

        if ( competicao == null )
        {
            return ResponseEntity.notFound().build();
        }

        try
        {
            Competicao competicaoAtualizado = competicaoService.atualizar( request );

            return ResponseEntity
                    .status( HttpStatus.OK )
                    .body( CompeticaoMapper.toResponse( competicaoAtualizado ) );
        }
        catch ( CompeticaoUpdateException e )
        {
            return ResponseEntity.status( HttpStatus.BAD_REQUEST ).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar (
            @PathVariable Long id
    )
    {
        Competicao competicao = competicaoService.buscarPorId( id );

        if ( competicao == null )
        {
            return ResponseEntity.notFound().build();
        }

        competicaoService.deletarCompeticao( id );

        return ResponseEntity.noContent().build();
    }
}