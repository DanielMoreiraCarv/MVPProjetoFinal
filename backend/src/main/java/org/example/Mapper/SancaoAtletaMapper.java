package org.example.Mapper;

import org.example.Models.Response.SancaoAtletaResponse;
import org.example.Models.SancaoAtleta;

import java.util.List;

public class SancaoAtletaMapper
{
    private SancaoAtletaMapper ()
    {
    }

    public static SancaoAtletaResponse toResponse ( SancaoAtleta entity )
    {
        SancaoAtletaResponse sj = new SancaoAtletaResponse( entity.getId(),
                entity.getSancao().getId(), entity.getAtleta().getId(),
                entity.getAtleta().getNome(), entity.getPartidaInicioSancao().getId(),
                entity.getJustificativa(), entity.getPartidasRestantes() );

        return sj;
    }

    public static List<SancaoAtletaResponse> toResponse ( List<SancaoAtleta> entitys ){
        if ( entitys == null || entitys.isEmpty() )
        {
            return null;
        }

        return entitys.stream().map( SancaoAtletaMapper::toResponse ).toList();
    }
}
