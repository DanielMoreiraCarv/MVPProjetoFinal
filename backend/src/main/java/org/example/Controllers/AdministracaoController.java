package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Mapper.AdministracaoMapper;
import org.example.Models.Administracao;
import org.example.Models.Request.AdministracaoCreateRequest;
import org.example.Models.Request.AdministracaoUpdateRequest;
import org.example.Models.Response.AdministracaoResponse;
import org.example.Services.AdministracaoService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/administracao")
@CrossOrigin(origins = "*")
public class AdministracaoController
{
    @Autowired
    private AdministracaoService administracaoService;

    @PostMapping
    public ResponseEntity<AdministracaoResponse> criar (
            @Valid @RequestBody AdministracaoCreateRequest request
    )
    {
        Administracao administracao = administracaoService.criar(
                AdministracaoMapper.toEntity( request )
        );

        return ResponseEntity
                .status( HttpStatus.CREATED )
                .body( AdministracaoMapper.toResponse( administracao ) );
    }

    @GetMapping
    public ResponseEntity<List<AdministracaoResponse>> listar ()
    {
        List<AdministracaoResponse> administracoes = AdministracaoMapper.toResponse(
                administracaoService.listarTodas()
        );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( administracoes );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministracaoResponse> buscarPorId (
            @PathVariable Long id
    )
    {
        Administracao administracao = administracaoService.buscarPorId( id );

        if ( administracao == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( AdministracaoMapper.toResponse( administracao ) );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdministracaoResponse> atualizar (
            @PathVariable Long id,
            @Valid @RequestBody AdministracaoUpdateRequest request
    )
    {
        Administracao administracao = administracaoService.buscarPorId( id );

        if ( administracao == null )
        {
            return ResponseEntity.notFound().build();
        }

        Administracao administracaoAtualizada = administracaoService.atualizar( request );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( AdministracaoMapper.toResponse( administracaoAtualizada ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar (
            @PathVariable Long id
    )
    {
        Administracao administracao = administracaoService.buscarPorId( id );

        if ( administracao == null )
        {
            return ResponseEntity.notFound().build();
        }

        administracaoService.deletar( id );

        return ResponseEntity.noContent().build();
    }
}
