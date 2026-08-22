package org.example.Controllers;

import jakarta.websocket.server.PathParam;
import org.example.Models.Campeonato;
import org.example.Services.CampeonatoService;
import org.example.Services.TimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/campeonatos")
@CrossOrigin(origins = "*")
public class CampeonatoController
{

    @Autowired
    private CampeonatoService campeonatoService;

    @Autowired
    private TimeService timeService;

    @PostMapping
    public ResponseEntity<Campeonato> criar ( @RequestBody Campeonato campeonato )
    {
        try
        {
            Campeonato novo = campeonatoService.criarCampeonato( campeonato );
            return ResponseEntity.status( HttpStatus.CREATED ).body( novo );
        } catch ( Exception e )
        {
            return ResponseEntity.status( HttpStatus.BAD_REQUEST ).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campeonato> buscarPorId ( @PathVariable Long id )
    {
        Campeonato campeonato = campeonatoService.buscarPorId( id );
        if ( campeonato != null )
        {
            return ResponseEntity.ok( campeonato );
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Campeonato>> listarTodos ()
    {
        List<Campeonato> campeonatos = campeonatoService.listarTodos();
        return ResponseEntity.ok( campeonatos );
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<?> listarMataMata ( @PathParam("tipo") String tipo )
    {
        if ( tipo.equals( "matamata" ) )
        {
            List<Campeonato> campeonatos = campeonatoService.listarMataMata();
            return ResponseEntity.ok( campeonatos );
        } else if ( tipo.equals( "pontosCorridos" ) )
        {
            List<Campeonato> campeonatoes = campeonatoService.listarPontosCorridos();
            return ResponseEntity.ok( campeonatoes );
        }

        return ResponseEntity.status( HttpStatus.BAD_REQUEST )
                             .body( "tipo " + "de " + "campeonato não encontrado" );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campeonato> atualizar ( @PathVariable Long id,
            @RequestBody Campeonato campeonatoAtualizado )
    {
        Campeonato atualizado = campeonatoService.atualizarCampeonato( id, campeonatoAtualizado );
        if ( atualizado != null )
        {
            return ResponseEntity.ok( atualizado );
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar ( @PathVariable Long id )
    {
        Campeonato campeonato = campeonatoService.buscarPorId( id );
        if ( campeonato != null )
        {
            campeonatoService.deletarCampeonato( id );
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}