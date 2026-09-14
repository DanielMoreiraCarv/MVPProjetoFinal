package org.example.Mapper;

import org.example.Exception.CampeonatoCreateException;
import org.example.Exception.CampeonatoUpdateException;
import org.example.Models.Campeonato;
import org.example.Models.Request.CampeonatoCreateRequest;
import org.example.Models.Request.CampeonatoUpdateRequest;
import org.example.Models.Response.CampeonatoResponse;
import org.example.Models.Response.TimeResponse;
import org.example.Models.Time;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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
        campeonato.setDescricao( campeonatoRequest.descricao() );
        campeonato.setCategoria( campeonatoRequest.categoria() );
        campeonato.setAdministracao( AdministracaoMapper.toReferencia( campeonatoRequest.idAdministracao() ) );

        return campeonato;
    }

    public static Campeonato toEntity ( CampeonatoUpdateRequest updateRequest, Campeonato campeonato )
            throws CampeonatoUpdateException
    {
        campeonato.setNome( updateRequest.nome() );
        campeonato.setLstModalidades( ModalidadeMapper.toReferencias( updateRequest.modalidadesIds() ) );
        campeonato.setLstTimes( toTimes( updateRequest.timesIds() ) );
        campeonato.setMataMata( Boolean.TRUE.equals( updateRequest.isMataMata() ) );
        campeonato.setDescricao( updateRequest.descricao() );
        campeonato.setCategoria( updateRequest.categoria() );
        campeonato.setAdministracao( AdministracaoMapper.toReferencia( updateRequest.idAdministracao() ) );

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

        Long idAdministracao = campeonato.getAdministracao() == null
                ? null
                : campeonato.getAdministracao().getId();

        return new CampeonatoResponse( campeonato.getId(), campeonato.getNome(),
                ModalidadeMapper.toResponse( campeonato.getLstModalidades() ), times,
                campeonato.isMataMata(), campeonato.getDescricao(), campeonato.getCategoria(),
                idAdministracao );
    }

    public static List<CampeonatoResponse> toResponse ( List<Campeonato> campeonatos )
    {
        if ( campeonatos == null || campeonatos.isEmpty() )
        {
            return Collections.emptyList();
        }

        return campeonatos.stream().map( CampeonatoMapper::toResponse ).toList();
    }

    private static List<Time> toTimes ( List<Long> timesIds )
    {
        if ( timesIds == null )
        {
            return new ArrayList<>();
        }

        return timesIds.stream().map( id -> {
            Time time = new Time();
            time.setId( id );
            return time;
        } ).collect( Collectors.toCollection( ArrayList::new ) );
    }
}
