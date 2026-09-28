package org.example.Mapper;

import org.example.Exception.CompeticaoCreateException;
import org.example.Exception.CompeticaoUpdateException;
import org.example.Models.Competicao;
import org.example.Models.Request.CompeticaoCreateRequest;
import org.example.Models.Request.CompeticaoUpdateRequest;
import org.example.Models.Response.CompeticaoResponse;
import org.example.Models.Response.EquipeResponse;
import org.example.Models.Equipe;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CompeticaoMapper
{
    private CompeticaoMapper ()
    {
    }

    public static Competicao toEntity ( CompeticaoCreateRequest competicaoRequest )
            throws CompeticaoCreateException
    {
        if ( competicaoRequest.modalidadesIds() == null || competicaoRequest.modalidadesIds().isEmpty() )
        {
            throw new CompeticaoCreateException();
        }

        Competicao competicao = new Competicao();
        competicao.setNome( competicaoRequest.nome() );
        competicao.setLstModalidades( ModalidadeMapper.toReferencias( competicaoRequest.modalidadesIds() ) );
        competicao.setMataMata( Boolean.TRUE.equals( competicaoRequest.isMataMata() ) );
        competicao.setDescricao( competicaoRequest.descricao() );
        competicao.setCategoria( competicaoRequest.categoria() );
        competicao.setAdministracao( AdministracaoMapper.toReferencia( competicaoRequest.idAdministracao() ) );

        return competicao;
    }

    public static Competicao toEntity ( CompeticaoUpdateRequest updateRequest, Competicao competicao )
            throws CompeticaoUpdateException
    {
        competicao.setNome( updateRequest.nome() );
        competicao.setLstModalidades( ModalidadeMapper.toReferencias( updateRequest.modalidadesIds() ) );
        competicao.setLstEquipes( toTimes( updateRequest.equipesIds() ) );
        competicao.setMataMata( Boolean.TRUE.equals( updateRequest.isMataMata() ) );
        competicao.setDescricao( updateRequest.descricao() );
        competicao.setCategoria( updateRequest.categoria() );
        competicao.setAdministracao( AdministracaoMapper.toReferencia( updateRequest.idAdministracao() ) );

        return competicao;
    }

    public static CompeticaoResponse toResponse ( Competicao competicao )
    {
        if ( competicao == null )
        {
            return null;
        }

        List<EquipeResponse> equipes = competicao.getLstEquipes() == null
                ? Collections.emptyList()
                : competicao.getLstEquipes().stream().map( EquipeMapper::toResponse ).toList();

        Long idAdministracao = competicao.getAdministracao() == null
                ? null
                : competicao.getAdministracao().getId();

        return new CompeticaoResponse( competicao.getId(), competicao.getNome(),
                ModalidadeMapper.toResponse( competicao.getLstModalidades() ), equipes,
                competicao.isMataMata(), competicao.getDescricao(), competicao.getCategoria(),
                idAdministracao, competicao.getEstado() );
    }

    public static List<CompeticaoResponse> toResponse ( List<Competicao> competicoes )
    {
        if ( competicoes == null || competicoes.isEmpty() )
        {
            return Collections.emptyList();
        }

        return competicoes.stream().map( CompeticaoMapper::toResponse ).toList();
    }

    private static List<Equipe> toTimes ( List<Long> equipesIds )
    {
        if ( equipesIds == null )
        {
            return new ArrayList<>();
        }

        return equipesIds.stream().map( id -> {
            Equipe equipe = new Equipe();
            equipe.setId( id );
            return equipe;
        } ).collect( Collectors.toCollection( ArrayList::new ) );
    }
}
