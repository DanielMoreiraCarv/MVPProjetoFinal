package org.example.Mapper;

import org.example.Exception.CampeonatoCreateException;
import org.example.Exception.CampeonatoUpdateException;
import org.example.Models.Campeonato;
import org.example.Models.EnumTipoEsporte;
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
        Campeonato campeonato = new Campeonato();
        campeonato.setNome( campeonatoRequest.nome() );
        campeonato.setEnumTipoEsporte( toEsportes( campeonatoRequest.lstEsportes() ) );
        campeonato.setMataMata( Boolean.TRUE.equals( campeonatoRequest.isMataMata() ) );

        return campeonato;
    }

    public static Campeonato toEntity ( CampeonatoUpdateRequest updateRequest, Campeonato campeonato )
            throws CampeonatoUpdateException
    {
        campeonato.setNome( updateRequest.nome() );
        campeonato.setEnumTipoEsporte( updateRequest.esportes() );
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

        List<String> esportes = campeonato.getEnumTipoEsporte() == null
                ? Collections.emptyList()
                : campeonato.getEnumTipoEsporte().stream().map( EnumTipoEsporte::name ).toList();

        List<TimeResponse> times = campeonato.getLstTimes() == null
                ? Collections.emptyList()
                : campeonato.getLstTimes().stream().map( TimeMapper::toResponse ).toList();

        return new CampeonatoResponse( campeonato.getId(), campeonato.getNome(), esportes, times,
                campeonato.isMataMata() );
    }

    private static List<EnumTipoEsporte> toEsportes ( List<String> esportes )
    {
        if ( esportes == null )
        {
            return Collections.emptyList();
        }

        return esportes.stream().map( CampeonatoMapper::toEsporte ).toList();
    }

    private static EnumTipoEsporte toEsporte ( String valor )
    {
        if ( valor == null )
        {
            throw new CampeonatoCreateException();
        }

        try
        {
            return EnumTipoEsporte.valueOf( valor.trim().toUpperCase() );
        }
        catch ( IllegalArgumentException excecao )
        {
            for ( EnumTipoEsporte tipo : EnumTipoEsporte.values() )
            {
                if ( tipo.getDescricao().equalsIgnoreCase( valor ) )
                {
                    return tipo;
                }
            }

            throw new CampeonatoCreateException();
        }
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
