package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Mapper.FederacaoMapper;
import org.example.Models.Federacao;
import org.example.Models.Request.FederacaoCreateRequest;
import org.example.Models.Request.FederacaoUpdateRequest;
import org.example.Models.Response.FederacaoResponse;
import org.example.Services.FederacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/federacao")
@CrossOrigin(origins = "*")
public class FederacaoController
{
    @Autowired
    private FederacaoService federacaoService;

    @PostMapping
    public ResponseEntity<FederacaoResponse> criar (
            @Valid @RequestBody FederacaoCreateRequest request
    )
    {
        Federacao federacao = federacaoService.criar( FederacaoMapper.toEntity( request ) );

        return ResponseEntity
                .status( HttpStatus.CREATED )
                .body( FederacaoMapper.toResponse( federacao ) );
    }

    @GetMapping
    public ResponseEntity<List<FederacaoResponse>> listar ()
    {
        return ResponseEntity
                .status( HttpStatus.OK )
                .body( FederacaoMapper.toResponse( federacaoService.listarTodas() ) );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FederacaoResponse> buscarPorId (
            @PathVariable Long id
    )
    {
        Federacao federacao = federacaoService.buscarPorId( id );

        if ( federacao == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( FederacaoMapper.toResponse( federacao ) );
    }

    /** O árbitro guarda o nome da federação como texto: renomear aqui não altera os árbitros já cadastrados. */
    @PutMapping("/{id}")
    public ResponseEntity<FederacaoResponse> atualizar (
            @PathVariable Long id,
            @Valid @RequestBody FederacaoUpdateRequest request
    )
    {
        Federacao federacao = federacaoService.buscarPorId( id );

        if ( federacao == null )
        {
            return ResponseEntity.notFound().build();
        }

        Federacao federacaoAtualizada = federacaoService.salvar(
                FederacaoMapper.toEntity( request, federacao )
        );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( FederacaoMapper.toResponse( federacaoAtualizada ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar (
            @PathVariable Long id
    )
    {
        Federacao federacao = federacaoService.buscarPorId( id );

        if ( federacao == null )
        {
            return ResponseEntity.notFound().build();
        }

        try
        {
            federacaoService.deletar( id );
        }
        catch ( DataIntegrityViolationException erro )
        {
            return ResponseEntity.status( HttpStatus.CONFLICT )
                                 .body( "Não é possível apagar a federação porque há times vinculados a ela" );
        }

        return ResponseEntity.noContent().build();
    }
}
