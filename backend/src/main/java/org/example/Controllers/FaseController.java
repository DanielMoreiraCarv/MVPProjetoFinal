package org.example.Controllers;

import jakarta.websocket.server.PathParam;
import org.example.Mapper.FaseMapper;
import org.example.Models.Fase;
import org.example.Models.Request.FaseCreateRequest;
import org.example.Models.Request.FaseUpdateRequest;
import org.example.Models.Response.FaseResponse;
import org.example.Services.FaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fase")
@CrossOrigin(origins = "*")
public class FaseController
{
    @Autowired
    private FaseService faseService;

    @PostMapping
    public ResponseEntity<?> criarFase ( @RequestBody FaseCreateRequest request )
    {
        FaseResponse fase = faseService.criarFase( request );

        return ResponseEntity.status( HttpStatus.CREATED ).body( fase );

    }

    @PutMapping
    public ResponseEntity<?> atualizarFase ( @RequestBody FaseUpdateRequest request )
    {
        Fase fase = faseService.buscarFasePorId( request.id() );

        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        FaseResponse faseAtualizada = faseService.atualizarFase( request, fase );

        return ResponseEntity.ok( faseAtualizada );
    }

    @GetMapping
    public ResponseEntity<?> buscarFases ()
    {
        return ResponseEntity.ok( FaseMapper.toResponse( faseService.buscarFases() ) );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarFasePorId ( @PathParam("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( fase );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarFase ( @PathParam("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );
        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        if ( fase.getFaseSucessora() != null )
        {
            return ResponseEntity.status( HttpStatus.CONFLICT ).body( "Não é possível apagar a " +
                                                                      "fase porque ela possui uma" +
                                                                      " " +
                                                                      "sucessora" );
        }

        faseService.deleteFase( fase );

        return ResponseEntity.ok().build();

    }
}
