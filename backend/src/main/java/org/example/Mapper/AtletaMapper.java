package org.example.Mapper;

import org.example.Exception.AtletaCreateException;
import org.example.Exception.AtletaUpdateException;
import org.example.Models.Atleta;
import org.example.Models.Request.AtletaCreateRequest;
import org.example.Models.Request.AtletaUpdateRequest;
import org.example.Models.Response.AtletaResponse;

import java.util.List;

public class AtletaMapper
{
    private AtletaMapper ()
    {
    }

    public static Atleta toEntity ( AtletaCreateRequest atletaRequest )
            throws AtletaCreateException
    {
        Atleta atleta = new Atleta();
        atleta.setNome( atletaRequest.nome() );
        atleta.setIdade( atletaRequest.idade() == null ? 0 : atletaRequest.idade() );
        atleta.setNumCamisa(
                atletaRequest.numCamisa() == null ? 0 : atletaRequest.numCamisa() );
        atleta.setCpf( atletaRequest.cpf() );
        atleta.setExpulso( false );
        atleta.setGols( 0 );
        atleta.setAssistencias( 0 );
        atleta.setCartoes( 0 );
        atleta.setPontos( 0 );

        return atleta;
    }

    public static Atleta toEntity ( AtletaUpdateRequest updateRequest, Atleta atleta )
            throws AtletaUpdateException
    {
        atleta.setNome( updateRequest.nome() );
        if ( updateRequest.idade() != null )
        {
            atleta.setIdade( updateRequest.idade() );
        }
        if ( updateRequest.numCamisa() != null )
        {
            atleta.setNumCamisa( updateRequest.numCamisa() );
        }
        atleta.setCpf( updateRequest.cpf() );
        if ( updateRequest.pontos() != null )
        {
            atleta.setPontos( updateRequest.pontos() );
        }
        if ( updateRequest.cartoes() != null )
        {
            atleta.setCartoes( updateRequest.cartoes() );
        }
        if ( updateRequest.expulso() != null )
        {
            atleta.setExpulso( updateRequest.expulso() );
        }

        return atleta;
    }

    public static AtletaResponse toResponse ( Atleta atleta )
    {
        if ( atleta == null )
        {
            return null;
        }

        return new AtletaResponse( atleta.getId(), atleta.getNome(), atleta.getIdade(),
                atleta.getNumCamisa(), atleta.getCpf(), atleta.getPontos(), atleta.getGols(),
                atleta.getAssistencias() );
    }

    public static List<AtletaResponse> toResponse ( List<Atleta> lstAtletas )
    {
        if ( lstAtletas == null )
        {
            return null;
        }

        return lstAtletas.stream().map( AtletaMapper::toResponse ).toList();
    }
}
