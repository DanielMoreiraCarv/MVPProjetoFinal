package org.example.Mapper;

import org.example.Models.Response.SancaoJogadorResponse;
import org.example.Models.SancaoJogador;

import java.util.List;

public class SancaoJogadorMapper
{
    private SancaoJogadorMapper ()
    {
    }

    public static SancaoJogadorResponse toResponse ( SancaoJogador entity )
    {
        SancaoJogadorResponse sj = new SancaoJogadorResponse( entity.getId(),
                entity.getSancao().getId(), entity.getJogador().getId(),
                entity.getJogador().getNome(), entity.getPartidaInicioSancao().getId(),
                entity.getJustificativa(), entity.getPartidasRestantes() );

        return sj;
    }

    public static List<SancaoJogadorResponse> toResponse ( List<SancaoJogador> entitys ){
        if ( entitys == null || entitys.isEmpty() )
        {
            return null;
        }

        return entitys.stream().map( SancaoJogadorMapper::toResponse ).toList();
    }
}
