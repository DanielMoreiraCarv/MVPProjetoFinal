package org.example.Controllers;

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
@CrossOrigin(origins = "*")
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

    @PutMapping
    public ResponseEntity<?> atualizarArbitro ( @RequestBody ArbitroUpdateResquest request )
    {
        Arbitro arbitro = arbitroService.buscarPorId( request.id() );

        if ( arbitro == null )
        {
            return ResponseEntity.notFound().build();
        }

        Arbitro arbitroAtualizado = arbitroService.atualizarArbitro( request.id(),
                request );

        return ResponseEntity.ok( ArbitroMapper.toResponse( arbitroAtualizado ) );
    }

    @GetMapping
    public ResponseEntity<?> listarArbitros (  ){
        List<Arbitro> lstArbitros = arbitroService.listarTodos() ;

        if (  lstArbitros == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( ArbitroMapper.toResponse( lstArbitros ) );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarArbitro ( @PathVariable Long id )
    {
        Arbitro arbitro = arbitroService.buscarPorId( id );
        if ( arbitro == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( ArbitroMapper.toResponse( arbitro ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArbitro ( @PathVariable Long id )
    {
        Arbitro arbitro = arbitroService.buscarPorId( id );

        if ( arbitro == null ){
            return ResponseEntity.notFound().build();
        }

        arbitroService.deletarArbitro( id );

        return ResponseEntity.ok().build();
    }
}
