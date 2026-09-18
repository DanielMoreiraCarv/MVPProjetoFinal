package org.example.Mapper;

import org.example.Exception.CampeonatoCreateException;
import org.example.Exception.CampeonatoUpdateException;
import org.example.Models.Campeonato;
import org.example.Models.Request.CampeonatoCreateRequest;
import org.example.Models.Request.CampeonatoUpdateRequest;
import org.example.Models.Response.CampeonatoResponse;
import org.example.Models.Response.TimeResponse;
import org.example.Models.Time;

import java.util.Collections;
import java.util.List;

public class CampeonatoMapper
{
    private CampeonatoMapper ()
    {
    }

    public static Campeonato toEntity ( CampeonatoCreateRequest campeonatoRequest )
            throws CampeonatoCreateException
    {
        if ( campeonatoRequest.modalidadesIds() == null || campeonatoRequest.modalidadesIds().isEmpty() )
        {
            throw new CampeonatoCreateException();
        }

        Campeonato campeonato = new Campeonato();
        campeonato.setNome( campeonatoRequest.nome() );
        campeonato.setLstModalidades( ModalidadeMapper.toReferencias( campeonatoRequest.modalidadesIds() ) );
        campeonato.setMataMata( Boolean.TRUE.equals( campeonatoRequest.isMataMata() ) );

        return campeonato;
    }

    public static Campeonato toEntity ( CampeonatoUpdateRequest updateRequest, Campeonato campeonato )
            throws CampeonatoUpdateException
    {
        campeonato.setNome( updateRequest.nome() );
        campeonato.setLstModalidades( ModalidadeMapper.toReferencias( updateRequest.modalidadesIds() ) );
        campeonato.setLstTimes( toTimes( updateRequest.timesIds() ) );
        campeonato.setMataMata( updateRequest.mataMata() );

        return campeonato;
    }

    public static CampeonatoResponse toResponse ( Campeonato campeonato )
    {
        if ( campeonato == null )
        {
            return null;
        }

        List<TimeResponse> times = campeonato.getLstTimes() == null
                ? Collections.emptyList()
                : campeonato.getLstTimes().stream().map( TimeMapper::toResponse ).toList();

        return new CampeonatoResponse( campeonato.getId(), campeonato.getNome(),
                ModalidadeMapper.toResponse( campeonato.getLstModalidades() ), times,
                campeonato.isMataMata() );
    }

    private static List<Time> toTimes ( List<Long> timesIds )
    {
        if ( timesIds == null )
        {
            return Collections.emptyList();
        }

        return timesIds.stream().map( id -> {
            Time time = new Time();
            time.setId( id );
            return time;
        } ).toList();
    }
}
