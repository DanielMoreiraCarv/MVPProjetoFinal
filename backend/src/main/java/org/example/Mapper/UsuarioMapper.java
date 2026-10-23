package org.example.Mapper;

import org.example.Models.Papel;
import org.example.Models.Usuario;
import org.example.Models.UsuarioPapel;
import org.example.Models.Response.PapelResponse;
import org.example.Models.Response.UsuarioResponse;

import java.util.Comparator;
import java.util.List;

public class UsuarioMapper
{
    private UsuarioMapper ()
    {
    }

    public static UsuarioResponse toResponse ( Usuario usuario )
    {
        if ( usuario == null )
        {
            return null;
        }

        List<UsuarioResponse.PapelConcedidoResponse> papeis = usuario.getPapeis().stream()
                .map( UsuarioMapper::toResponse )
                .sorted( Comparator.comparing( UsuarioResponse.PapelConcedidoResponse::codigo ) )
                .toList();

        return new UsuarioResponse( usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.isAtivo(), usuario.getCriadoEm(), papeis );
    }

    private static UsuarioResponse.PapelConcedidoResponse toResponse ( UsuarioPapel concessao )
    {
        var administracao = concessao.getAdministracao();

        return new UsuarioResponse.PapelConcedidoResponse( concessao.getPapel().getCodigo(),
                administracao == null ? null : administracao.getId(),
                administracao == null ? null : administracao.getNome() );
    }

    public static PapelResponse toResponse ( Papel papel )
    {
        return new PapelResponse( papel.getId(), papel.getCodigo(), papel.getDescricao() );
    }
}
