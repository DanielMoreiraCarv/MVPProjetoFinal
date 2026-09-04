package org.example.Mapper;

import org.example.Exception.PartidaCreateException;
import org.example.Exception.PartidaUpdateException;
import org.example.Models.Arbitro;
import org.example.Models.Campeonato;
import org.example.Models.Partida;
import org.example.Models.Request.PartidaUpdateRequest;
import org.example.Models.Response.PartidaResponse;
import org.example.Models.Time;

public class PartidaMapper
{
    private PartidaMapper ()
    {
    }

    public static Partida toEntity ( PartidaUpdateRequest partidaRequest )
            throws PartidaCreateException
    {
        Partida partida = new Partida();
        aplicarRequest( partidaRequest, partida );

        return partida;
    }

    public static Partida toEntity ( PartidaUpdateRequest updateRequest, Partida partida )
            throws PartidaUpdateException
    {
        aplicarRequest( updateRequest, partida );

        return partida;
    }

    public static PartidaResponse toResponse ( Partida partida )
    {
        if ( partida == null )
        {
            return null;
        }

        Campeonato campeonato = partida.getCampeonato();
        Time mandante = partida.getTimeMandante();
        Time visitante = partida.getTimeVisitante();

        return new PartidaResponse( partida.getId(), TimeMapper.toResponse( mandante ),
                TimeMapper.toResponse( visitante ),
                campeonato == null ? null : campeonato.getNome(),
                campeonato == null ? null : campeonato.getId(),
                resolverNomeVencedor( partida ), partida.isRealizada(), partida.getEnumFasePartida(),
                ArbitroMapper.toResponse( partida.getArbitro() ),
                partida.getResultadoMandante() + " x " + partida.getResultadoVisitante() );
    }

    private static void aplicarRequest ( PartidaUpdateRequest request, Partida partida )
    {
        partida.setTimeMandante( toTime( request.idMandante() ) );
        partida.setTimeVisitante( toTime( request.idVisitante() ) );
        partida.setCampeonato( toCampeonato( request.idCampeonato() ) );
        if ( request.resultadoVisitante() != null )
        {
            partida.setResultadoVisitante( request.resultadoVisitante() );
        }
        if ( request.resultadoMandante() != null )
        {
            partida.setResultadoMandante( request.resultadoMandante() );
        }
        partida.setArbitro( toArbitro( request.idArbitro() ) );
    }

    private static String resolverNomeVencedor ( Partida partida )
    {
        if ( partida.getIdVencedor() == null )
        {
            return null;
        }

        Time mandante = partida.getTimeMandante();
        if ( mandante != null && partida.getIdVencedor().equals( mandante.getId() ) )
        {
            return mandante.getNome();
        }

        Time visitante = partida.getTimeVisitante();
        if ( visitante != null && partida.getIdVencedor().equals( visitante.getId() ) )
        {
            return visitante.getNome();
        }

        return null;
    }

    private static Time toTime ( Long id )
    {
        if ( id == null )
        {
            return null;
        }

        Time time = new Time();
        time.setId( id );
        return time;
    }

    private static Campeonato toCampeonato ( Long id )
    {
        if ( id == null )
        {
            return null;
        }

        Campeonato campeonato = new Campeonato();
        campeonato.setId( id );
        return campeonato;
    }

    private static Arbitro toArbitro ( Long id )
    {
        if ( id == null )
        {
            return null;
        }

        Arbitro arbitro = new Arbitro();
        arbitro.setId( id );
        return arbitro;
    }
}
