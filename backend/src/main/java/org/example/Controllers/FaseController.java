package org.example.Controllers;

import org.example.Fases.ResultadoDaValidacao;
import org.example.Mapper.FaseMapper;
import org.example.Mapper.PartidaMapper;
import org.example.Models.Classificado;
import org.example.Models.Fase;
import org.example.Models.Partida;
import org.example.Models.Request.FaseCreateRequest;
import org.example.Models.Request.FaseUpdateRequest;
import org.example.Models.Response.ClassificadoResponse;
import org.example.Models.Response.FaseResponse;
import org.example.Models.Response.PartidaResponse;
import org.example.Models.Response.ValidacaoResponse;
import org.example.Services.FaseService;
import org.example.Services.TimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/fase")
@CrossOrigin(origins = "*")
public class FaseController
{
    @Autowired
    private FaseService faseService;

    @Autowired
    private TimeService timeService;

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
    public ResponseEntity<?> buscarFasePorId ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok( fase );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarFase ( @PathVariable("id") Long id )
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

    @GetMapping("/{id}/validacao")
    public ResponseEntity<?> validarConfrontos ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        ResultadoDaValidacao resultado = faseService.validarConfrontos( fase );

        return ResponseEntity.ok( new ValidacaoResponse( resultado.ehValido(), resultado.erros() ) );
    }

    /** Gera os confrontos da fase a partir da configuração atual, substituindo os que já existiam. */
    @PostMapping("/{id}/confrontos")
    public ResponseEntity<?> gerarConfrontos ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        try
        {
            return ResponseEntity.status( HttpStatus.CREATED )
                                 .body( paraResposta( faseService.gerarConfrontos( fase ) ) );
        }
        catch ( IllegalStateException erro )
        {
            return ResponseEntity.badRequest().body( erro.getMessage() );
        }
    }

    /** Recalcula os confrontos a partir dos resultados já registrados, sem apagar o que já existe. */
    @PutMapping("/{id}/confrontos")
    public ResponseEntity<?> atualizarConfrontos ( @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, String> opcoes )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        try
        {
            return ResponseEntity.ok( paraResposta( faseService.atualizarConfrontos( fase, opcoes ) ) );
        }
        catch ( IllegalStateException erro )
        {
            return ResponseEntity.badRequest().body( erro.getMessage() );
        }
    }

    @GetMapping("/{id}/classificacao")
    public ResponseEntity<?> classificacao ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            return ResponseEntity.notFound().build();
        }

        List<Classificado> classificacao = faseService.classificacaoDe( fase );

        List<ClassificadoResponse> resposta = classificacao.stream()
                .map( classificado -> new ClassificadoResponse( classificado.posicao(),
                        classificado.idTime(), nomeDoTime( classificado.idTime() ) ) )
                .toList();

        return ResponseEntity.ok( resposta );
    }

    private String nomeDoTime ( Long idTime )
    {
        var time = timeService.buscarPorId( idTime );
        return time == null ? null : time.getNome();
    }

    private List<PartidaResponse> paraResposta ( List<Partida> confrontos )
    {
        return confrontos.stream().map( PartidaMapper::toResponse ).toList();
    }
}
