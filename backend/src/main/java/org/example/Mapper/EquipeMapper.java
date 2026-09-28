package org.example.Mapper;

import org.example.Exception.EquipeCreateException;
import org.example.Exception.EquipeUpdateException;
import org.example.Models.Federacao;
import org.example.Models.Request.EquipeCreateRequest;
import org.example.Models.Request.EquipeUpdateRequest;
import org.example.Models.Response.AtletaResponse;
import org.example.Models.Response.EquipeResponse;
import org.example.Models.Equipe;

import java.util.Collections;
import java.util.List;

public class EquipeMapper
{
    private EquipeMapper ()
    {
    }

    public static Equipe toEntity ( EquipeCreateRequest equipeRequest )
            throws EquipeCreateException
    {
        Equipe equipe = new Equipe();
        equipe.setNome( equipeRequest.nome() );
        equipe.setFederacao( toFederacao( equipeRequest.idFederacao() ) );

        return equipe;
    }

    public static Equipe toEntity ( EquipeUpdateRequest updateRequest, Equipe equipe )
            throws EquipeUpdateException
    {
        equipe.setNome( updateRequest.nome() );
        equipe.setFederacao( toFederacao( updateRequest.idFederacao() ) );

        return equipe;
    }

    public static EquipeResponse toResponse ( Equipe equipe )
    {
        if ( equipe == null )
        {
            return null;
        }

        List<AtletaResponse> atletas = equipe.getLstAtletas() == null
                ? Collections.emptyList()
                : equipe.getLstAtletas().stream().map( AtletaMapper::toResponse ).toList();

        return new EquipeResponse( equipe.getId(), equipe.getNome(),
                FederacaoMapper.toResponse( equipe.getFederacao() ), atletas,
                ModalidadeMapper.toResponse( equipe.getModalidade() ) );
    }

    private static Federacao toFederacao ( Long idFederacao )
    {
        if ( idFederacao == null )
        {
            return null;
        }

        Federacao federacao = new Federacao();
        federacao.setId( idFederacao );
        return federacao;
    }

    public static List<EquipeResponse> toResponse(List<Equipe> equipes)
    {
        if (equipes == null || equipes.isEmpty())
        {
            return Collections.emptyList();
        }

        return equipes.stream()
                    .map(EquipeMapper::toResponse)
                    .toList();
    }
}
