package org.example.Mapper;

import org.example.Exception.TimeCreateException;
import org.example.Exception.TimeUpdateException;
import org.example.Models.Federacao;
import org.example.Models.Request.TimeCreateRequest;
import org.example.Models.Request.TimeUpdateRequest;
import org.example.Models.Response.JogadoresResponse;
import org.example.Models.Response.TimeResponse;
import org.example.Models.Time;

import java.util.Collections;
import java.util.List;

public class TimeMapper
{
    private TimeMapper ()
    {
    }

    public static Time toEntity ( TimeCreateRequest timeRequest )
            throws TimeCreateException
    {
        Time time = new Time();
        time.setNome( timeRequest.nome() );
        time.setFederacao( toFederacao( timeRequest.idFederacao() ) );

        return time;
    }

    public static Time toEntity ( TimeUpdateRequest updateRequest, Time time )
            throws TimeUpdateException
    {
        time.setNome( updateRequest.nome() );
        time.setFederacao( toFederacao( updateRequest.idFederacao() ) );

        return time;
    }

    public static TimeResponse toResponse ( Time time )
    {
        if ( time == null )
        {
            return null;
        }

        List<JogadoresResponse> jogadores = time.getLstJogadores() == null
                ? Collections.emptyList()
                : time.getLstJogadores().stream().map( JogadoresMapper::toResponse ).toList();

        return new TimeResponse( time.getId(), time.getNome(),
                FederacaoMapper.toResponse( time.getFederacao() ), jogadores,
                null );
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

    public static List<TimeResponse> toResponse(List<Time> times)
    {
        if (times == null || times.isEmpty())
        {
            return Collections.emptyList();
        }

        return times.stream()
                    .map(TimeMapper::toResponse)
                    .toList();
    }
}
