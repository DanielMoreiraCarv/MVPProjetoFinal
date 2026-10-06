package org.example.Mapper;

import org.example.Models.EventoDaSumula;
import org.example.Models.Response.EventoDaSumulaResponse;
import org.example.Models.Response.SumulaResponse;
import org.example.Models.Sumula;

import java.util.Collections;
import java.util.List;

public class SumulaMapper
{
    private SumulaMapper ()
    {
    }

    public static SumulaResponse toResponse ( Sumula sumula )
    {
        if ( sumula == null )
        {
            return null;
        }

        List<String> ocorrencias = sumula.getOcorrencias() == null
                ? Collections.emptyList()
                : sumula.getOcorrencias();

        return new SumulaResponse( sumula.getId(), PartidaMapper.toResponse( sumula.getPartida() ),
                ArbitroMapper.toResponse( sumula.getArbitro() ), sumula.getPlacarMandante(),
                sumula.getPlacarVisitante(), ocorrencias, sumula.getObservacoesRelatadas(),
                sumula.getDataFechamento(), sumula.isAssinada(), sumula.getModo().name(),
                sumula.getEventos().stream().map( SumulaMapper::toResponse ).toList() );
    }

    public static EventoDaSumulaResponse toResponse ( EventoDaSumula evento )
    {
        return new EventoDaSumulaResponse( evento.getId(), evento.getAtleta().getId(),
                evento.getAtleta().getNome(), evento.getAtleta().getNumCamisa(),
                evento.getEquipe().getId(), evento.getTipo().name(), evento.isAutomatico(),
                evento.getRegistradoEm() );
    }

    public static List<SumulaResponse> toResponse ( List<Sumula> sumulas )
    {
        if ( sumulas == null )
        {
            return List.of();
        }
        return sumulas.stream().map( SumulaMapper::toResponse ).toList();
    }
}
