package org.example.Controllers;

import org.example.Mapper.AtributoFaseMapper;
import org.example.Models.Response.ChaveamentoResponse;
import org.example.Models.Response.LinhaDaTabelaResponse;
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

        // Sem try: `IllegalStateException` já é tratada centralmente e sai no
        // envelope de erro. O catch que havia aqui devolvia texto puro, fora
        // do contrato, e o cliente recebia uma string solta onde esperava
        // `{ erro: { codigo, mensagem } }`.
        return ResponseEntity.status( HttpStatus.CREATED )
                             .body( paraResposta( faseService.gerarConfrontos( fase ) ) );
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

        return ResponseEntity.ok( paraResposta( faseService.atualizarConfrontos( fase, opcoes ) ) );
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

    /**
     * A tabela de pontos das fases que se decidem por pontos — grupos e
     * pontos corridos —, com quem entra na fase já listado e zerado antes do
     * primeiro jogo.
     */
    @GetMapping("/{id}/tabela")
    public ResponseEntity<List<LinhaDaTabelaResponse>> tabela ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
        }

        return ResponseEntity.ok( faseService.tabelaDe( fase ).stream()
                .map( linha -> {
                    var d = linha.desempenho();
                    return new LinhaDaTabelaResponse( linha.grupo(), linha.posicao(), d.getIdTime(),
                            nomeDoTime( d.getIdTime() ), d.getPontos(), d.getJogos(), d.getVitorias(),
                            d.getEmpates(), d.getDerrotas(), d.getGolsPro(), d.getGolsContra(),
                            d.getSaldoDeGols() );
                } )
                .toList() );
    }

    /** A chave da eliminatória, inclusive as etapas que ainda não foram geradas. */
    @GetMapping("/{id}/chaveamento")
    public ResponseEntity<ChaveamentoResponse> chaveamento ( @PathVariable("id") Long id )
    {
        Fase fase = faseService.buscarFasePorId( id );

        if ( fase == null )
        {
            throw NaoEncontradoException.de( "Fase", id );
        }

        var chave = faseService.chaveamentoDe( fase );
        return ResponseEntity.ok( new ChaveamentoResponse( chave.participantes(), chave.pararEm(),
                chave.etapas().stream()
                     .map( etapa -> new ChaveamentoResponse.Etapa( etapa.rodada(), etapa.nome(), etapa.equipes(),
                             etapa.confrontos().stream().map( this::paraConfronto ).toList() ) )
                     .toList() ) );
    }

    private ChaveamentoResponse.Confronto paraConfronto ( org.example.Fases.ConfrontoDaChave confronto )
    {
        Integer golsMandante = null;
        Integer golsVisitante = null;
        for ( Partida partida : confronto.partidas() )
        {
            if ( !partida.isRealizada() )
            {
                continue;
            }
            boolean mesmoMando = java.util.Objects.equals( partida.getIdEquipeMandante(), confronto.idMandante() );
            golsMandante = ( golsMandante == null ? 0 : golsMandante )
                    + ( mesmoMando ? partida.getPlacarMandante() : partida.getPlacarVisitante() );
            golsVisitante = ( golsVisitante == null ? 0 : golsVisitante )
                    + ( mesmoMando ? partida.getPlacarVisitante() : partida.getPlacarMandante() );
        }

        return new ChaveamentoResponse.Confronto( confronto.jogo(), confronto.alimenta(),
                lado( confronto.idMandante(), confronto.origemMandante() ),
                lado( confronto.idVisitante(), confronto.origemVisitante() ),
                golsMandante, golsVisitante, confronto.idVencedor() != null, confronto.idVencedor(),
                confronto.partidas().stream().map( Partida::getId ).toList() );
    }

    private ChaveamentoResponse.Lado lado ( Long idEquipe, String origem )
    {
        return new ChaveamentoResponse.Lado( idEquipe, idEquipe == null ? null : nomeDoTime( idEquipe ), origem );
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
