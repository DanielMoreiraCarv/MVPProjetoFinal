package org.example.Controllers;

import org.example.Mapper.TabelaMapper;
import org.example.Models.Tabela;
import org.example.Services.TabelaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tabela")
public class TabelaController
{
    @Autowired
    private TabelaService tabelaService;

    @GetMapping
    public ResponseEntity<?> buscarTabela ()
    {
        List<Tabela> lst = tabelaService.listarTodas();
        return ResponseEntity.ok( TabelaMapper.toResponse( lst ) );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarTabelaPorId ( @PathVariable Long id )
    {
        Tabela tabela = tabelaService.buscarPorId( id );

        if ( tabela == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( TabelaMapper.toResponse( tabela ) );
    }

    @GetMapping("/campeonato/{id}")
    public ResponseEntity<?> buscarTabelaPorCampenato ( @PathVariable Long id )
    {
        Tabela tabela = tabelaService.buscarPorCampeonato( id );

        if ( tabela == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( TabelaMapper.toResponse( tabela ) );
    }
}
