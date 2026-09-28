package org.example.Mapper;

import org.example.Exception.PartidaCreateException;
import org.example.Exception.PartidaUpdateException;
import org.example.Models.Arbitro;
import org.example.Models.Competicao;
import org.example.Models.Partida;
import org.example.Models.Request.PartidaUpdateRequest;
import org.example.Models.Response.PartidaResponse;
import org.example.Models.Equipe;

public class PartidaMapper
{
    private PartidaMapper ()
    {
    }

    public static Partida toEntity ( PartidaUpdateRequest partidaRequest )
            throws PartidaCreateException
    {
        Partida partida = new Partida();
        aplicarRequest( partidaRequest, partida );

        return partida;
    }

    public static Partida toEntity ( PartidaUpdateRequest updateRequest, Partida partida )
            throws PartidaUpdateException
    {
        aplicarRequest( updateRequest, partida );

        return partida;
    }

    public static PartidaResponse toResponse ( Partida partida )
    {
        if ( partida == null )
        {
            return null;
        }

        Competicao competicao = partida.getCompeticao();
        Equipe mandante = partida.getEquipeMandante();
        Equipe visitante = partida.getEquipeVisitante();

        return new PartidaResponse( partida.getId(), EquipeMapper.toResponse( mandante ),
                EquipeMapper.toResponse( visitante ),
                competicao == null ? null : competicao.getNome(),
                competicao == null ? null : competicao.getId(),
                resolverNomeVencedor( partida ), partida.isRealizada(), partida.getEnumFasePartida(),
                ArbitroMapper.toResponse( partida.getArbitro() ),
                partida.getPlacarMandante() + " x " + partida.getPlacarVisitante() );
    }

    private static void aplicarRequest ( PartidaUpdateRequest request, Partida partida )
    {
        partida.setEquipeMandante( toTime( request.idEquipeMandante() ) );
        partida.setEquipeVisitante( toTime( request.idEquipeVisitante() ) );
        partida.setCompeticao( toCompeticao( request.idCompeticao() ) );
        if ( request.placarVisitante() != null )
        {
            partida.setPlacarVisitante( request.placarVisitante() );
        }
        if ( request.placarMandante() != null )
        {
            partida.setPlacarMandante( request.placarMandante() );
        }
        partida.setArbitro( toArbitro( request.idArbitro() ) );
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

    private static Equipe toTime ( Long id )
    {
        if ( id == null )
        {
            return null;
        }

        Equipe equipe = new Equipe();
        equipe.setId( id );
        return equipe;
    }

    private static Competicao toCompeticao ( Long id )
    {
        if ( id == null )
        {
            return null;
        }

        Competicao competicao = new Competicao();
        competicao.setId( id );
        return competicao;
    }

    private static Arbitro toArbitro ( Long id )
    {
        if ( id == null )
        {
            return null;
        }

        Arbitro arbitro = new Arbitro();
        arbitro.setId( id );
        return arbitro;
    }
}
