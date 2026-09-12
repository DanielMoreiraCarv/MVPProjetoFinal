package org.example.Mapper;

import org.example.Models.Campeonato;
import org.example.Models.EnumFasePartida;
import org.example.Models.Fase;
import org.example.Models.Request.FaseCreateRequest;
import org.example.Models.Request.FaseUpdateRequest;
import org.example.Models.Response.FaseResponse;

import java.util.List;

public class FaseMapper
{
    private FaseMapper ()
    {
    }

    public static Fase toEntity( FaseCreateRequest request ){
        Fase fase = new Fase();
        fase.setNome( request.nome() );
        fase.setOrdem(request.ordem());
        fase.setFasePartida( EnumFasePartida.valueOf( request.fasePartida() ) );

        Campeonato campeonato = new Campeonato();
        campeonato.setId( request.idCampeonato() );
        fase.setCampeonato( campeonato );
        return fase;
    }

    public static Fase toEntity ( FaseUpdateRequest request )
    {
        Fase fase = new Fase();
        fase.setId( request.id() );
        fase.setNome( request.nome() );
        fase.setOrdem( request.ordem() );
        fase.setFasePartida( request.fasePartida() );

        Campeonato campeonato = new Campeonato();
        campeonato.setId( request.idCampeonato() );
        fase.setCampeonato( campeonato );

        fase.setQuantidadeClassificados( request.qtdClassificados() );

        Fase faseSucessora = new Fase();
        faseSucessora.setId( request.idFaseSucessora() );
        fase.setFaseSucessora( faseSucessora );
        return fase;
    }

    public static FaseResponse toResponse ( Fase fase )
    {
        if ( fase == null )
        {
            return null;
        }

        return new FaseResponse( fase.getId(), fase.getNome(), fase.getOrdem(),
                fase.getFasePartida().getDescricao(), fase.getQuantidadeClassificados(),
                fase.getFaseSucessora() == null ? null : fase.getFaseSucessora().getId() );

    }

    public static List<FaseResponse> toResponse ( List<Fase> fases )
    {
        if ( fases == null || fases.isEmpty() )
        {
            return null;
        }

        return fases.stream().map( FaseMapper::toResponse ).toList();

    }
}
