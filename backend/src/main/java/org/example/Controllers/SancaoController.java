package org.example.Controllers;


import org.example.Mapper.SancaoAtletaMapper;
import org.example.Mapper.SancaoMapper;
import org.example.Models.Request.SancaoAtletaRequest;
import org.example.Models.Request.SancaoRequest;
import org.example.Models.Response.SancaoResponse;
import org.example.Models.Sancao;
import org.example.Models.SancaoAtleta;
import org.example.Services.SancaoAtletaService;
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
    private SancaoAtletaService sancaoAtletaService;

    //Controller das Regras das Sanções

    @PostMapping
    public ResponseEntity<?> criarSancao ( @RequestBody SancaoRequest request )
    {
        SancaoResponse sancao = sancaoService.criarSancao( request );

        return ResponseEntity.status( HttpStatus.CREATED ).body( sancao );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarSancao ( @PathVariable("id") Long id,
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
    public ResponseEntity<?> buscarSancaoPorId ( @PathVariable("id") Long id )
    {
        Sancao sancao = sancaoService.findById( id );

        if ( sancao == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( SancaoMapper.toResponse( sancao ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delteSancao ( @PathVariable("id") Long id )
    {
        Sancao sancao = sancaoService.findById( id );

        if ( sancao == null )
        {
            return ResponseEntity.notFound().build();
        }

        sancaoService.deletarSancao( id );

        return ResponseEntity.ok().build();
    }

    //Controller das Sanções por Atleta e Competicaos


    @PostMapping("/sancao")
    public ResponseEntity<?> criarSancaoParaUmAtleta (
            SancaoAtletaRequest request )
    {
        SancaoAtleta sancaoAtleta = sancaoAtletaService.criarSancaoAtleta( request );

        return ResponseEntity.status( HttpStatus.CREATED )
                             .body( SancaoAtletaMapper.toResponse( sancaoAtleta ) );
    }

    @PutMapping("/sancao/{id}")
    public ResponseEntity<?> editarSancaoParaUmAtleta ( @PathVariable("id") Long id,
            @RequestBody SancaoAtletaRequest request )
    {
        SancaoAtleta sjA = sancaoAtletaService.update( request, id );

        return ResponseEntity.ok( sjA );
    }

    @DeleteMapping("/sancao/inativar/{id}")
    public ResponseEntity<?> inativarSancaoParaUmAtleta ( @PathVariable Long id )
    {
        sancaoAtletaService.inativarSancaoAtleta( id );

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sancao/deletar/{id}")
    public ResponseEntity<?> deletarSancaoParaUmAtleta ( @PathVariable Long id )
    {
        sancaoAtletaService.deleteSancaoAtleta( id );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/sancao")
    public ResponseEntity<?> findAll ()
    {
        List<SancaoResponse> lst = sancaoService.findAll();
        return  ResponseEntity.ok( lst );
    }
}
