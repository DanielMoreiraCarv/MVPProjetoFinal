package org.example.Mapper;

import org.example.Models.Campeonato;
import org.example.Models.Response.PartidaResponse;
import org.example.Models.Response.TabelaResponse;
import org.example.Models.Tabela;

import java.util.Collections;
import java.util.List;

public class TabelaMapper
{
    private TabelaMapper ()
    {
    }

    public static TabelaResponse toResponse ( Tabela tabela )
    {
        return toResponse( tabela, null );
    }

    public static TabelaResponse toResponse ( Tabela tabela, Campeonato campeonato )
    {
        if ( tabela == null )
        {
            return null;
        }

        List<PartidaResponse> partidas = tabela.getPartidas() == null
                ? Collections.emptyList()
                : tabela.getPartidas().stream().map( PartidaMapper::toResponse ).toList();

        return new TabelaResponse( tabela.getId(), CampeonatoMapper.toResponse( campeonato ),
                partidas );
    }

    public static List<TabelaResponse> toResponse ( List<Tabela> tabelas )
    {
        if( tabelas == null || tabelas.isEmpty() )
        {
            return Collections.emptyList();
        }

        return tabelas.stream().map( TabelaMapper::toResponse ).toList();
    }
}
