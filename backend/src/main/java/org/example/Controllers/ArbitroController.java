package org.example.Controllers;

import org.example.Exception.NaoEncontradoException;
import org.example.Exception.ArbitroUpdateRequest;
import org.example.Mapper.ArbitroMapper;
import org.example.Models.Arbitro;
import org.example.Models.Federacao;
import org.example.Models.Request.ArbitroCreateRequest;
import org.example.Models.Request.ArbitroUpdateResquest;
import org.example.Services.ArbitroService;
import org.example.Services.FederacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/arbitro")
public class ArbitroController
{
    @Autowired
    private ArbitroService arbitroService;

    @Autowired
    private FederacaoService federacaoService;

    @PostMapping
    public ResponseEntity<?> criarArbitro ( @RequestBody ArbitroCreateRequest request )
    {

        Arbitro arbitro =
                arbitroService.criarArbitro( ArbitroMapper.toEntity( request ) );

        return ResponseEntity.status( HttpStatus.CREATED )
                             .body( ArbitroMapper.toResponse( arbitro ) );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarArbitro ( @PathVariable Long id,
            @RequestBody ArbitroUpdateResquest request )
    {
        Arbitro arbitro = arbitroService.buscarPorId( id );

        if ( arbitro == null )
        {
            throw NaoEncontradoException.de( "Árbitro", id );
        }

        Arbitro arbitroAtualizado = arbitroService.atualizarArbitro( id, request );

        return ResponseEntity.ok( ArbitroMapper.toResponse( arbitroAtualizado ) );
    }

    @GetMapping
    public ResponseEntity<?> listarArbitros (  ){
        // Lista vazia não é 404: a coleção existe, só não tem elemento.
        List<Arbitro> lstArbitros = arbitroService.listarTodos();

        return ResponseEntity.ok( ArbitroMapper.toResponse( lstArbitros ) );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarArbitro ( @PathVariable Long id )
    {
        Arbitro arbitro = arbitroService.buscarPorId( id );
        if ( arbitro == null )
        {
            throw NaoEncontradoException.de( "Árbitro", id );
        }

        return ResponseEntity.ok( ArbitroMapper.toResponse( arbitro ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArbitro ( @PathVariable Long id )
    {
        Arbitro arbitro = arbitroService.buscarPorId( id );

        if ( arbitro == null ){
            throw NaoEncontradoException.de( "Árbitro", id );
        }

        arbitroService.deletarArbitro( id );

        return ResponseEntity.ok().build();
    }
}
