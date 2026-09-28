package org.example.Mapper;

import org.example.Exception.ArbitroCreateException;
import org.example.Exception.ArbitroUpdateRequest;
import org.example.Models.Arbitro;
import org.example.Models.Federacao;
import org.example.Models.Request.ArbitroCreateRequest;
import org.example.Models.Request.ArbitroUpdateResquest;
import org.example.Models.Response.ArbitroResponse;

import java.util.List;

public class ArbitroMapper
{
    private ArbitroMapper ()
    {
    }

    public static Arbitro toEntity ( ArbitroCreateRequest arbitroRequest )
            throws ArbitroCreateException
    {
        Arbitro arbitro = new Arbitro();
        arbitro.setNome( arbitroRequest.nome() );
        arbitro.setCategoria( arbitroRequest.categoria() );
        // Lia do próprio objeto recém-criado, então nascia sempre nulo: a
        // federação escolhida era descartada em silêncio.
        arbitro.setFederacao( arbitroRequest.federacao() );

        return arbitro;
    }

    /** Campo ausente é campo que não muda. */
    public static Arbitro toEntity ( ArbitroUpdateResquest updateResquest, Arbitro arbitro )
    {
        if ( updateResquest.nome() != null && !updateResquest.nome().isBlank() )
        {
            arbitro.setNome( updateResquest.nome() );
        }
        if ( updateResquest.categoria() != null )
        {
            arbitro.setCategoria( updateResquest.categoria() );
        }
        if ( updateResquest.federacao() != null )
        {
            arbitro.setFederacao( updateResquest.federacao() );
        }
        if ( updateResquest.partidasApitadas() != null )
        {
            arbitro.setPartidasApitadas( updateResquest.partidasApitadas() );
        }

        return arbitro;
    }

    public static ArbitroResponse toResponse ( Arbitro arbitro )
    {
        if ( arbitro == null )
        {
            return null;
        }

        return new ArbitroResponse( arbitro.getId(), arbitro.getNome(),
                arbitro.getFederacao(), arbitro.getCategoria(),
                arbitro.getPartidasApitadas() );
    }

    public static List<ArbitroResponse> toResponse ( List<Arbitro> arbitros )
    {
        // Lista vazia devolve lista vazia, não null: `null` sai como corpo
        // vazio no 200, e aí o cliente estoura ao interpretar o JSON em vez de
        // receber `[]`. Coleção que existe sem elementos é `[]`.
        if ( arbitros == null )
        {
            return List.of();
        }

        return arbitros.stream().map( ArbitroMapper::toResponse ).toList();

    }
}
