package org.example.Controllers;

import org.example.Exception.NaoEncontradoException;
import jakarta.validation.Valid;

import org.example.Mapper.AtletaMapper;
import org.example.Models.Atleta;
import org.example.Models.Request.AtletaCreateRequest;
import org.example.Models.Request.AtletaUpdateRequest;
import org.example.Models.Response.AtletaResponse;
import org.example.Models.Equipe;
import org.example.Services.AtletaService;
import org.example.Services.EquipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/atleta")
public class AtletaController
{

    @Autowired
    private AtletaService atletaService;

    @Autowired
    private EquipeService equipeService;

    @PostMapping
    public ResponseEntity<?> criarAtleta (
            @Valid @RequestBody AtletaCreateRequest request )
    {
        Equipe equipe = equipeService.buscarPorId( request.idEquipe() );

        if ( equipe == null )
        {
            return ResponseEntity.badRequest().body( "Equipe não encontrada" );
        }

        Atleta atleta = atletaService.criarAtleta( request, equipe );

        return ResponseEntity.status( HttpStatus.CREATED )
                             .body( AtletaMapper.toResponse( atleta ) );


    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarAtleta (@PathVariable Long id, @Valid @RequestBody AtletaUpdateRequest request )
    {
        Atleta atleta = atletaService.buscarPorId( id );

        if ( atleta == null )
        {
            throw NaoEncontradoException.de( "Atleta", id );
        }

        Atleta atletaAtualizado = atletaService.atualizarAtleta( id, request );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( AtletaMapper.toResponse( atletaAtualizado ) );
    }

    @GetMapping
    public ResponseEntity<?> listarAtleta (
            @RequestParam(required = false) Long idEquipe )
    {
        List<AtletaResponse> lstAtletas = AtletaMapper.toResponse(
                idEquipe == null
                        ? atletaService.listarTodos()
                        : atletaService.listarPorEquipe( idEquipe ) );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( lstAtletas );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarAtleta ( @PathVariable long id )
    {
        Atleta atleta = atletaService.buscarPorId( id );

        if ( atleta == null )
        {
            throw NaoEncontradoException.de( "Atleta", id );
        }

        return ResponseEntity.ok( AtletaMapper.toResponse( atleta ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAtleta ( @PathVariable long id )
    {
        Atleta atleta = atletaService.buscarPorId( id );

        if ( atleta == null )
        {
            throw NaoEncontradoException.de( "Atleta", id );
        }

        atletaService.deletarAtleta( id );

        return ResponseEntity.ok().build();
    }
}
