package org.example.Mapper;

import org.example.Exception.FederacaoCreateException;
import org.example.Exception.FederacaoUpdateException;
import org.example.Models.Federacao;
import org.example.Models.Request.FederacaoCreateRequest;
import org.example.Models.Request.FederacaoUpdateRequest;
import org.example.Models.Response.FederacaoResponse;

public class FederacaoMapper
{
    private FederacaoMapper ()
    {
    }

    public static Federacao toEntity ( FederacaoCreateRequest federacaoRequest )
            throws FederacaoCreateException
    {
        Federacao federacao = new Federacao();
        federacao.setNomeFederacao( federacaoRequest.nome() );

        return federacao;
    }

    public static Federacao toEntity ( FederacaoUpdateRequest updateRequest, Federacao federacao )
            throws FederacaoUpdateException
    {
        federacao.setNomeFederacao( updateRequest.nome() );

        return federacao;
    }

    public static FederacaoResponse toResponse ( Federacao federacao )
    {
        if ( federacao == null )
        {
            return null;
        }

        return new FederacaoResponse( federacao.getId(), federacao.getNomeFederacao() );
    }
}
