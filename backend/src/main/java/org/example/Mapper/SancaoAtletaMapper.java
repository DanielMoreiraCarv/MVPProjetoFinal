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
        // Lista vazia devolve lista vazia, não null: `null` sai como corpo
        // vazio no 200, e o cliente estoura ao interpretar em vez de receber
        // `[]`. Coleção que existe sem elementos é `[]`.
        if ( entitys == null )
        {
            return List.of();
        }

        return entitys.stream().map( SancaoAtletaMapper::toResponse ).toList();
    }
}
