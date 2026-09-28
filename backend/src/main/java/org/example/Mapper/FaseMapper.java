package org.example.Mapper;

import org.example.Models.Competicao;
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

        Competicao competicao = new Competicao();
        competicao.setId( request.idCompeticao() );
        fase.setCompeticao( competicao );
        return fase;
    }

    public static Fase toEntity ( FaseUpdateRequest request )
    {
        Fase fase = new Fase();
        fase.setId( request.id() );
        fase.setNome( request.nome() );
        fase.setOrdem( request.ordem() );
        fase.setFasePartida( request.fasePartida() );

        Competicao competicao = new Competicao();
        competicao.setId( request.idCompeticao() );
        fase.setCompeticao( competicao );

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
        // Lista vazia devolve lista vazia, não null: `null` sai como corpo
        // vazio no 200, e o cliente estoura ao interpretar em vez de receber
        // `[]`. Coleção que existe sem elementos é `[]`.
        if ( fases == null )
        {
            return List.of();
        }

        return fases.stream().map( FaseMapper::toResponse ).toList();

    }
}
