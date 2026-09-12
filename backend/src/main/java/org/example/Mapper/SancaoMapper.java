package org.example.Mapper;

import org.example.Models.Campeonato;
import org.example.Models.EnumTipoEsporte;
import org.example.Models.Request.SancaoRequest;
import org.example.Models.Response.SancaoResponse;
import org.example.Models.Sancao;

import java.util.List;

public class SancaoMapper
{
    private SancaoMapper(){}

    public static Sancao toEntity ( SancaoRequest request, Campeonato campeonato )
    {
        Sancao sancao = new Sancao();
        sancao.setEnumTipoEsporte( EnumTipoEsporte.valueOf( request.tipoEsporte() ) );
        sancao.setCampeonato( campeonato );
        sancao.setQuantidadePartidasPadrao( request.qtdPartidas() );

        return sancao;
    }

    public static SancaoResponse toResponse ( Sancao sancao )
    {
        SancaoResponse response = new SancaoResponse( sancao.getId(),
                sancao.getQuantidadePartidasPadrao(), sancao.getEnumTipoEsporte().getDescricao(),
                sancao.getCampeonato().getId());

        return response;
    }

    public static List<SancaoResponse> toResponse ( List<Sancao> sancao )
    {
        if ( sancao == null || sancao.isEmpty() )
        {
            return null;
        }

        return sancao.stream().map( SancaoMapper::toResponse ).toList();

    }
}
