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

        List<String> observacoes = sumula.getObservacoesRelatadas() == null
                ? Collections.emptyList()
                : List.of( sumula.getObservacoesRelatadas() );

        return new SumulaResponse( sumula.getId(), PartidaMapper.toResponse( sumula.getPartida() ),
                ArbitroMapper.toResponse( sumula.getArbitro() ), sumula.getGolsMandante(),
                sumula.getGolsVisitante(), ocorrencias, observacoes, sumula.getDataFechamento(),
                sumula.isAssinada() );
    }
}
