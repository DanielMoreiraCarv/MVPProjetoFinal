package org.example.Mapper;

import org.example.Exception.JogadoresCreateException;
import org.example.Exception.JogadoresUpdateException;
import org.example.Models.Jogadores;
import org.example.Models.Request.JogadoresCreateRequest;
import org.example.Models.Request.JogadoresUpdateRequest;
import org.example.Models.Response.JogadoresResponse;

public class JogadoresMapper
{
    private JogadoresMapper ()
    {
    }

    public static Jogadores toEntity ( JogadoresCreateRequest jogadoresRequest )
            throws JogadoresCreateException
    {
        Jogadores jogador = new Jogadores();
        jogador.setNome( jogadoresRequest.nome() );
        jogador.setIdade( jogadoresRequest.idade() == null ? 0 : jogadoresRequest.idade() );
        jogador.setNumCamisa( jogadoresRequest.numCamisa() == null ? 0 : jogadoresRequest.numCamisa() );
        jogador.setCpf( jogadoresRequest.cpf() );
        jogador.setExpulso( false );
        jogador.setGols( 0 );
        jogador.setAssistencias( 0 );
        jogador.setCartoes( 0 );
        jogador.setPontos( 0 );

        return jogador;
    }

    public static Jogadores toEntity ( JogadoresUpdateRequest updateRequest, Jogadores jogador )
            throws JogadoresUpdateException
    {
        jogador.setNome( updateRequest.nome() );
        if ( updateRequest.idade() != null )
        {
            jogador.setIdade( updateRequest.idade() );
        }
        if ( updateRequest.numCamisa() != null )
        {
            jogador.setNumCamisa( updateRequest.numCamisa() );
        }
        jogador.setCpf( updateRequest.cpf() );
        if ( updateRequest.pontos() != null )
        {
            jogador.setPontos( updateRequest.pontos() );
        }
        if ( updateRequest.cartoes() != null )
        {
            jogador.setCartoes( updateRequest.cartoes() );
        }
        if ( updateRequest.expulso() != null )
        {
            jogador.setExpulso( updateRequest.expulso() );
        }

        return jogador;
    }

    public static JogadoresResponse toResponse ( Jogadores jogador )
    {
        if ( jogador == null )
        {
            return null;
        }

        return new JogadoresResponse( jogador.getId(), jogador.getNome(), jogador.getIdade(),
                jogador.getNumCamisa(), jogador.getCpf(), jogador.getPontos(), jogador.getGols(),
                jogador.getAssistencias() );
    }
}
