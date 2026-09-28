package org.example.Controllers;

import org.example.Exception.NaoEncontradoException;
import org.example.Mapper.AtletaMapper;
import org.example.Mapper.EquipeMapper;
import org.example.Models.Request.EquipeCreateRequest;
import org.example.Models.Request.EquipeUpdateRequest;
import org.example.Models.Response.AtletaResponse;
import org.example.Models.Response.EquipeResponse;
import org.example.Models.Equipe;
import org.example.Services.EquipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipe")
public class EquipeController
{
    @Autowired
    private EquipeService equipeService;

    @PostMapping
    public ResponseEntity<EquipeResponse> criarEquipe (
            @RequestBody EquipeCreateRequest request
    )
    {

        Equipe equipe = equipeService.criar( request );

        return ResponseEntity
                .status( HttpStatus.CREATED )
                .body( EquipeMapper.toResponse( equipe ) );
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipeResponse> atualizarEquipe (@PathVariable Long id, @RequestBody EquipeUpdateRequest request){
        Equipe equipe = equipeService.buscarPorId( id );
        if (equipe == null){
            throw NaoEncontradoException.de( "Equipe", id );
        }

        Equipe equipeAtualizada = equipeService.atualizarEquipe( id, request);

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( EquipeMapper.toResponse( equipeAtualizada ) );
    }

    @GetMapping
    public ResponseEntity<List<EquipeResponse>> listarEquipe (
            @RequestParam(required = false) Long idModalidade
    )
    {
        List<EquipeResponse> equipes = EquipeMapper.toResponse(
                idModalidade == null
                        ? equipeService.listarTodos()
                        : equipeService.listarPorModalidade( idModalidade ) );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( equipes );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipeResponse> getEquipe (@PathVariable Long id){
        Equipe equipe = equipeService.buscarPorId( id );

        if( equipe == null )
        {
            throw NaoEncontradoException.de( "Equipe", id );
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( EquipeMapper.toResponse( equipe ) );
    }

    /** O elenco da equipe. */
    @GetMapping("/{id}/atleta")
    public ResponseEntity<List<AtletaResponse>> listarElenco ( @PathVariable Long id )
    {
        return ResponseEntity.ok(
                AtletaMapper.toResponse( equipeService.listarAtletasDaEquipe( id ) ) );
    }

    /** Traz um atleta já cadastrado para a equipe. */
    @PostMapping("/{id}/atleta/{idAtleta}")
    public ResponseEntity<EquipeResponse> adicionarAoElenco (
            @PathVariable Long id,
            @PathVariable Long idAtleta
    )
    {
        return ResponseEntity.ok(
                EquipeMapper.toResponse( equipeService.adicionarAtletaAEquipe( id, idAtleta ) ) );
    }

    /** Tira o atleta da equipe. Ele continua cadastrado. */
    @DeleteMapping("/{id}/atleta/{idAtleta}")
    public ResponseEntity<EquipeResponse> removerDoElenco (
            @PathVariable Long id,
            @PathVariable Long idAtleta
    )
    {
        return ResponseEntity.ok(
                EquipeMapper.toResponse( equipeService.removerAtletaDaEquipe( id, idAtleta ) ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipe ( @PathVariable Long id )
    {
        Equipe equipe = equipeService.buscarPorId( id );

        if( equipe == null )
        {
            throw NaoEncontradoException.de( "Equipe", id );
        }

        equipeService.deletarEquipe( id );

        return ResponseEntity
                .status( HttpStatus.OK ).build();
    }


}