package org.example.Controllers;


import jakarta.websocket.server.PathParam;
import org.example.Mapper.SancaoMapper;
import org.example.Models.Request.SancaoRequest;
import org.example.Models.Response.SancaoResponse;
import org.example.Models.Sancao;
import org.example.Services.SancaoJogadorService;
import org.example.Services.SancaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sancao")
@CrossOrigin(origins = "*")
public class SancaoController
{
    @Autowired
    private SancaoService sancaoService;

    @Autowired
    private SancaoJogadorService sancaoJogadorService;

    //Controller das Regras das Sanções

    @PostMapping
    public ResponseEntity<?> criarSancao ( @RequestBody SancaoRequest request )
    {
        SancaoResponse sancao = sancaoService.criarSancao( request );

        return ResponseEntity.status( HttpStatus.CREATED ).body( sancao );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarSancao ( @PathParam("id") Long id,
            @RequestBody SancaoRequest request )
    {
        return ResponseEntity.ok( sancaoService.atualizarSancao( id, request ) );
    }

    @GetMapping
    public ResponseEntity<?> buscarTodas ()
    {
        List<SancaoResponse> lst = sancaoService.findAll();
        return ResponseEntity.ok( lst );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarSancaoPorId ( @PathParam("id") Long id )
    {
        Sancao sancao = sancaoService.findById( id );

        if ( sancao == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( SancaoMapper.toResponse( sancao ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delteSancao ( @PathParam("id") Long id )
    {
        Sancao sancao = sancaoService.findById( id );

        if ( sancao == null )
        {
            return ResponseEntity.notFound().build();
        }

        sancaoService.deletarSancao( id );

        return ResponseEntity.ok().build();
    }

    //Controller das Sanções por Jogadores e Campeonatos


}
