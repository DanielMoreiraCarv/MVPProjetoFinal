package org.example.Controllers;

import org.example.Mapper.AtributoFaseMapper;
import org.example.Models.Response.AtributoFaseResponse;
import org.example.Models.Request.ValorDeAtributoRequest;
import org.example.Models.EnumFasePartida;
import jakarta.validation.Valid;
import org.example.Exception.NaoEncontradoException;
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
import org.example.Services.EquipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/fase")
public class FaseController
{
    @Autowired
    private FaseService faseService;

    @Autowired
    private EquipeService timeService;

    @PostMapping
    public ResponseEntity<?> criarFase ( @RequestBody FaseCreateRequest request )
    {
        FaseResponse fase = faseService.criarFase( request );

        return ResponseEntity.status( HttpStatus.CREATED ).body( fase );

    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarFase ( @PathVariable("id") Long id,
            @RequestBody FaseUpdateRequest request )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
        }

        FaseResponse faseAtualizada = faseService.atualizarFase( request, fase );

        return ResponseEntity.ok( faseAtualizada );
    }

    /**
     * As fases, opcionalmente só as de uma competição.
     *
     * Sem o filtro a tela da competição recebia as fases de todas as
     * competições e teria que peneirar no cliente — o que só funciona
     * enquanto o número de competições é pequeno.
     */
    @GetMapping
    public ResponseEntity<?> buscarFases (
            @RequestParam(required = false) Long idCompeticao
    )
    {
        List<Fase> fases = idCompeticao == null
                ? faseService.buscarFases()
                : faseService.buscarFasePorCompeticao( idCompeticao );

        return ResponseEntity.ok( FaseMapper.toResponse( fases ) );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarFasePorId ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
        }

        return ResponseEntity.ok( fase );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarFase ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );
        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
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
            throw NaoEncontradoException.de( "Fase", id );
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
            throw NaoEncontradoException.de( "Fase", id );
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
            throw NaoEncontradoException.de( "Fase", id );
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

    /**
     * O catálogo de configuração de um tipo de fase: quais campos ele aceita,
     * de que tipo, obrigatórios ou não, com o valor padrão e a descrição.
     *
     * É o que o construtor usa para montar o formulário sozinho. Sem esta
     * rota, cada tipo de fase precisaria dos seus campos escritos à mão na
     * tela — e o modelo de atributos existe justamente para evitar isso.
     */
    @GetMapping("/atributo")
    public ResponseEntity<List<AtributoFaseResponse>> atributosDoTipo (
            @RequestParam EnumFasePartida tipoFase
    )
    {
        return ResponseEntity.ok( faseService.atributosDoTipo( tipoFase ).stream()
                                             .map( AtributoFaseMapper::toResponse )
                                             .toList() );
    }

    /** O catálogo do tipo desta fase, já com o valor que ela tem em cada campo. */
    @GetMapping("/{id}/atributo")
    public ResponseEntity<List<AtributoFaseResponse>> atributosDaFase (
            @PathVariable("id") Long id
    )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
        }

        return ResponseEntity.ok( faseService.atributosDaFase( fase ) );
    }

    /** Grava um campo de configuração da fase. */
    @PutMapping("/{id}/atributo/{codigo}")
    public ResponseEntity<List<AtributoFaseResponse>> definirAtributo (
            @PathVariable("id") Long id,
            @PathVariable("codigo") String codigo,
            @Valid @RequestBody ValorDeAtributoRequest request
    )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
        }

        faseService.definirAtributo( fase, codigo, request.valor() );

        return ResponseEntity.ok( faseService.atributosDaFase( fase ) );
    }

    @GetMapping("/{id}/classificacao")
    public ResponseEntity<?> classificacao ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
        }

        List<Classificado> classificacao = faseService.classificacaoDe( fase );

        List<ClassificadoResponse> resposta = classificacao.stream()
                .map( classificado -> new ClassificadoResponse( classificado.posicao(),
                        classificado.idEquipe(), nomeDoTime( classificado.idEquipe() ) ) )
                .toList();

        return ResponseEntity.ok( resposta );
    }

    private String nomeDoTime ( Long idEquipe )
    {
        var equipe = timeService.buscarPorId( idEquipe );
        return equipe == null ? null : equipe.getNome();
    }

    private List<PartidaResponse> paraResposta ( List<Partida> confrontos )
    {
        return confrontos.stream().map( PartidaMapper::toResponse ).toList();
    }
}
