package org.example.Mapper;

import org.example.Exception.ArbitroCreateException;
import org.example.Exception.ArbitroUpdateRequest;
import org.example.Models.Arbitro;
import org.example.Models.Request.ArbitroCreateRequest;
import org.example.Models.Request.ArbitroUpdateResquest;
import org.example.Models.Response.ArbitroResponse;

public class ArbitroMapper
{
    private ArbitroMapper ()
    {
    }

    public static Arbitro toEntity ( ArbitroCreateRequest arbitroRequest )
            throws ArbitroCreateException
    {
        Arbitro arbitro = new Arbitro();
        arbitro.setNome( arbitroRequest.nome() );
        arbitro.setCategoria( arbitroRequest.categoria() );
        arbitro.setFederacao( arbitroRequest.federacao() );

        return arbitro;
    }

    public static Arbitro toEntity ( ArbitroUpdateResquest updateResquest, Arbitro arbitro )
            throws ArbitroUpdateRequest
    {
        arbitro.setNome( updateResquest.nome() );
        arbitro.setCategoria( updateResquest.categoria() );
        arbitro.setFederacao( updateResquest.federacao() );
        arbitro.setPartidasApitadas( updateResquest.partidasApitadas() );

        return arbitro;
    }

    public static ArbitroResponse toResponse ( Arbitro arbitro )
    {
        if ( arbitro == null )
        {
            return null;
        }

        return new ArbitroResponse( arbitro.getId(), arbitro.getNome(),
                arbitro.getFederacao(), arbitro.getPartidasApitadas() );
    }
}
