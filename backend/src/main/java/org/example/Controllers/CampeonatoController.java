package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.Exception.CampeonatoCreateException;
import org.example.Exception.CampeonatoUpdateException;
import org.example.Mapper.CampeonatoMapper;
import org.example.Models.Campeonato;
import org.example.Models.Request.CampeonatoCreateRequest;
import org.example.Models.Request.CampeonatoUpdateRequest;
import org.example.Models.Response.CampeonatoResponse;
import org.example.Services.CampeonatoService;
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
@RequestMapping("/api/v1/campeonato")
@CrossOrigin(origins = "*")
public class CampeonatoController
{
    @Autowired
    private CampeonatoService campeonatoService;

    @PostMapping
    public ResponseEntity<CampeonatoResponse> criar (
            @Valid @RequestBody CampeonatoCreateRequest request
    )
    {
        try
        {
            Campeonato campeonato = campeonatoService.criar(
                    CampeonatoMapper.toEntity( request )
            );

            return ResponseEntity
                    .status( HttpStatus.CREATED )
                    .body( CampeonatoMapper.toResponse( campeonato ) );
        }
        catch ( CampeonatoCreateException e )
        {
            return ResponseEntity.status( HttpStatus.BAD_REQUEST ).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<CampeonatoResponse>> listar (
            @RequestParam(required = false) Long idAdministracao
    )
    {
        List<CampeonatoResponse> campeonatos;

        if ( idAdministracao != null )
        {
            campeonatos = CampeonatoMapper.toResponse(
                    campeonatoService.listarPorAdministracao( idAdministracao )
            );
        }
        else
        {
            campeonatos = CampeonatoMapper.toResponse(
                    campeonatoService.listarTodos()
            );
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( campeonatos );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampeonatoResponse> buscarPorId (
            @PathVariable Long id
    )
    {
        Campeonato campeonato = campeonatoService.buscarPorId( id );

        if ( campeonato == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( CampeonatoMapper.toResponse( campeonato ) );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampeonatoResponse> atualizar (
            @PathVariable Long id,
            @Valid @RequestBody CampeonatoUpdateRequest request
    )
    {
        Campeonato campeonato = campeonatoService.buscarPorId( id );

        if ( campeonato == null )
        {
            return ResponseEntity.notFound().build();
        }

        try
        {
            Campeonato campeonatoAtualizado = campeonatoService.atualizar( request );

            return ResponseEntity
                    .status( HttpStatus.OK )
                    .body( CampeonatoMapper.toResponse( campeonatoAtualizado ) );
        }
        catch ( CampeonatoUpdateException e )
        {
            return ResponseEntity.status( HttpStatus.BAD_REQUEST ).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar (
            @PathVariable Long id
    )
    {
        Campeonato campeonato = campeonatoService.buscarPorId( id );

        if ( campeonato == null )
        {
            return ResponseEntity.notFound().build();
        }

        campeonatoService.deletarCampeonato( id );

        return ResponseEntity.noContent().build();
    }
}