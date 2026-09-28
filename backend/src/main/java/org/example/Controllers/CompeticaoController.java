package org.example.Controllers;

import org.example.Exception.NaoEncontradoException;
import jakarta.validation.Valid;
import org.example.Exception.CompeticaoCreateException;
import org.example.Exception.CompeticaoUpdateException;
import org.example.Mapper.CompeticaoMapper;
import org.example.Models.Competicao;
import org.example.Models.Equipe;
import org.example.Models.Request.CompeticaoCreateRequest;
import org.example.Models.Request.CompeticaoUpdateRequest;
import org.example.Models.Response.CompeticaoResponse;
import org.example.Services.CompeticaoService;
import org.example.Services.EquipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/competicao")
public class CompeticaoController
{
    @Autowired
    private CompeticaoService competicaoService;

    @Autowired
    private EquipeService equipeService;

    @PostMapping
    public ResponseEntity<CompeticaoResponse> criar (
            @Valid @RequestBody CompeticaoCreateRequest request
    )
    {
        try
        {
            Competicao competicao = competicaoService.criar(
                    CompeticaoMapper.toEntity( request )
            );

            return ResponseEntity
                    .status( HttpStatus.CREATED )
                    .body( CompeticaoMapper.toResponse( competicao ) );
        }
        catch ( CompeticaoCreateException e )
        {
            return ResponseEntity.status( HttpStatus.BAD_REQUEST ).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<CompeticaoResponse>> listar (
            @RequestParam(required = false) Long idAdministracao
    )
    {
        List<CompeticaoResponse> competicoes;

        if ( idAdministracao != null )
        {
            competicoes = CompeticaoMapper.toResponse(
                    competicaoService.listarPorAdministracao( idAdministracao )
            );
        }
        else
        {
            competicoes = CompeticaoMapper.toResponse(
                    competicaoService.listarTodos()
            );
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( competicoes );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompeticaoResponse> buscarPorId (
            @PathVariable Long id
    )
    {
        Competicao competicao = competicaoService.buscarPorId( id );

        if ( competicao == null )
        {
            throw NaoEncontradoException.de( "Competição", id );
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( CompeticaoMapper.toResponse( competicao ) );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompeticaoResponse> atualizar (
            @PathVariable Long id,
            @Valid @RequestBody CompeticaoUpdateRequest request
    )
    {
        Competicao competicao = competicaoService.buscarPorId( id );

        if ( competicao == null )
        {
            throw NaoEncontradoException.de( "Competição", id );
        }

        Competicao competicaoAtualizado = competicaoService.atualizar( request );

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( CompeticaoMapper.toResponse( competicaoAtualizado ) );
    }

    /**
     * Inscreve uma equipe na competição.
     *
     * O caminho para isto era `PUT /competicao/{id}` com a lista `equipesIds`
     * inteira: leitura, alteração e escrita no cliente, em que duas abas
     * abertas sobrescrevem uma à outra e um corpo sem a lista apagava todas as
     * inscrições. Aqui o pedido é o que ele é — uma inscrição.
     */
    @PostMapping("/{id}/equipe/{idEquipe}")
    public ResponseEntity<CompeticaoResponse> inscreverEquipe (
            @PathVariable Long id,
            @PathVariable Long idEquipe
    )
    {
        Equipe equipe = equipeService.buscarPorId( idEquipe );

        if ( equipe == null )
        {
            throw NaoEncontradoException.de( "Equipe", idEquipe );
        }

        Competicao competicao = competicaoService.adicionarEquipeACompeticao( id, equipe );

        return ResponseEntity.ok( CompeticaoMapper.toResponse( competicao ) );
    }

    /** Remove a inscrição. A equipe continua existindo fora da competição. */
    @DeleteMapping("/{id}/equipe/{idEquipe}")
    public ResponseEntity<CompeticaoResponse> removerEquipe (
            @PathVariable Long id,
            @PathVariable Long idEquipe
    )
    {
        Competicao competicao = competicaoService.removerEquipeDaCompeticao( id, idEquipe );

        return ResponseEntity.ok( CompeticaoMapper.toResponse( competicao ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar (
            @PathVariable Long id
    )
    {
        Competicao competicao = competicaoService.buscarPorId( id );

        if ( competicao == null )
        {
            throw NaoEncontradoException.de( "Competição", id );
        }

        competicaoService.deletarCompeticao( id );

        return ResponseEntity.noContent().build();
    }
}