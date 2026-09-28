package org.example.Mapper;

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
                sumula.getDataFechamento(), sumula.isAssinada() );
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
