package org.example.Controllers;

import org.example.Mapper.JogadoresMapper;
import org.example.Models.Jogadores;
import org.example.Models.Request.JogadoresCreateRequest;
import org.example.Models.Request.JogadoresUpdateRequest;
import org.example.Models.Response.JogadoresResponse;
import org.example.Models.Time;
import org.example.Services.JogadoresService;
import org.example.Services.TimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jogador")
@CrossOrigin(origins = "*")
public class JogadorController
{

    @Autowired
    private JogadoresService jogadoresService;

    @Autowired
    private TimeService timeService;

    @PostMapping
    public ResponseEntity<?> criarJogador (
            @RequestBody JogadoresCreateRequest request )
    {
        Time time = timeService.buscarPorId( request.idTime() );

        if ( time == null )
        {
            return ResponseEntity.badRequest().body( "Time não encontrado" );
        }

        Jogadores jogador = jogadoresService.criarJogador( request, time );

        return ResponseEntity.status( HttpStatus.CREATED )
                             .body( JogadoresMapper.toResponse( jogador ) );


    }

    @PutMapping
    public ResponseEntity<?> atualizarJogador ( @RequestBody JogadoresUpdateRequest request )
    {
        Jogadores jogador = jogadoresService.buscarPorId( request.id() );

        if ( jogador == null )
        {
            return ResponseEntity.notFound().build();
        }

        Jogadores jogadorAtualizado = jogadoresService.atualizarJogador( request.id(), request );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( JogadoresMapper.toResponse( jogadorAtualizado ) );
    }

    @GetMapping
    public ResponseEntity<?> listarJogadores ()
    {
        List<JogadoresResponse> lstJogadores =
                JogadoresMapper.toResponse( jogadoresService.listarTodos() );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( lstJogadores );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarJogador ( @PathVariable long id )
    {
        Jogadores jogador = jogadoresService.buscarPorId( id );

        if ( jogador == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( JogadoresMapper.toResponse( jogador ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJogador ( @PathVariable long id )
    {
        Jogadores jogador = jogadoresService.buscarPorId( id );

        if ( jogador == null )
        {
            return ResponseEntity.notFound().build();
        }

        jogadoresService.deletarJogador( id );

        return ResponseEntity.ok().build();
    }
}
