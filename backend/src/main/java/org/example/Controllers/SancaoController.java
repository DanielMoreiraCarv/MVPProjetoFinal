package org.example.Controllers;


import org.example.Exception.NaoEncontradoException;
import org.example.Mapper.SancaoMapper;
import org.example.Models.Request.SancaoRequest;
import org.example.Models.Response.SancaoResponse;
import org.example.Models.Sancao;
import org.example.Services.SancaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * A regra de sanção de uma competição: quantas partidas de suspensão um tipo
 * de infração custa.
 *
 * Este controller servia dois recursos ao mesmo tempo — a regra e a punição
 * aplicada a um atleta — com a segunda pendurada em `/sancao/sancao`. A
 * punição por atleta agora tem recurso próprio, em `/sancao_atleta`.
 */
@RestController
@RequestMapping("/api/v1/sancao")
public class SancaoController
{
    @Autowired
    private SancaoService sancaoService;


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
            throw NaoEncontradoException.de( "Sanção", id );
        }

        return ResponseEntity.ok( SancaoMapper.toResponse( sancao ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delteSancao ( @PathVariable("id") Long id )
    {
        Sancao sancao = sancaoService.findById( id );

        if ( sancao == null )
        {
            throw NaoEncontradoException.de( "Sanção", id );
        }

        sancaoService.deletarSancao( id );

        return ResponseEntity.ok().build();
    }
}
