package org.example.Mapper;

import org.example.Models.Competicao;
import org.example.Models.Equipe;
import org.example.Models.Partida;
import org.example.Models.Response.EquipeResumoResponse;
import org.example.Models.Response.PartidaResponse;

import java.util.List;

public class PartidaMapper
{
    private PartidaMapper ()
    {
    }

    public static PartidaResponse toResponse ( Partida partida )
    {
        if ( partida == null )
        {
            return null;
        }

        Competicao competicao = partida.getCompeticao();

        return new PartidaResponse(
                partida.getId(),
                resumo( partida.getEquipeMandante() ),
                resumo( partida.getEquipeVisitante() ),
                competicao == null ? null : competicao.getNome(),
                competicao == null ? null : competicao.getId(),
                resolverNomeVencedor( partida ),
                partida.isRealizada(),
                partida.getEnumFasePartida(),
                ArbitroMapper.toResponse( partida.getArbitro() ),
                partida.getPlacarMandante(),
                partida.getPlacarVisitante(),
                partida.getDataHora(),
                partida.getLocal() );
    }

    public static List<PartidaResponse> toResponse ( List<Partida> partidas )
    {
        if ( partidas == null )
        {
            return List.of();
        }
        return partidas.stream().map( PartidaMapper::toResponse ).toList();
    }

    private static EquipeResumoResponse resumo ( Equipe equipe )
    {
        if ( equipe == null )
        {
            return null;
        }
        return new EquipeResumoResponse( equipe.getId(), equipe.getNome() );
    }

    private static String resolverNomeVencedor ( Partida partida )
    {
        if ( partida.getIdEquipeVencedora() == null )
        {
            return null;
        }

        Equipe mandante = partida.getEquipeMandante();
        if ( mandante != null && partida.getIdEquipeVencedora().equals( mandante.getId() ) )
        {
            return mandante.getNome();
        }

        Equipe visitante = partida.getEquipeVisitante();
        if ( visitante != null && partida.getIdEquipeVencedora().equals( visitante.getId() ) )
        {
            return visitante.getNome();
        }

        return null;
    }
}
