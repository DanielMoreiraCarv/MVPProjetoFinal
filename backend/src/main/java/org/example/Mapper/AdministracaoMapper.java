package org.example.Mapper;

import org.example.Models.Administracao;
import org.example.Models.Request.AdministracaoCreateRequest;
import org.example.Models.Request.AdministracaoUpdateRequest;
import org.example.Models.Response.AdministracaoResponse;

import java.util.Collections;
import java.util.List;

public class AdministracaoMapper
{
    private AdministracaoMapper ()
    {
    }

    public static Administracao toEntity ( AdministracaoCreateRequest request )
    {
        Administracao administracao = new Administracao();
        administracao.setNome( request.nome() );
        administracao.setDescricao( request.descricao() );

        return administracao;
    }

    public static Administracao toEntity ( AdministracaoUpdateRequest request, Administracao administracao )
    {
        administracao.setNome( request.nome() );
        administracao.setDescricao( request.descricao() );

        return administracao;
    }

    public static AdministracaoResponse toResponse ( Administracao administracao )
    {
        if ( administracao == null )
        {
            return null;
        }

        return new AdministracaoResponse( administracao.getId(), administracao.getNome(),
                administracao.getDescricao() );
    }

    public static List<AdministracaoResponse> toResponse ( List<Administracao> administracoes )
    {
        if ( administracoes == null || administracoes.isEmpty() )
        {
            return Collections.emptyList();
        }

        return administracoes.stream().map( AdministracaoMapper::toResponse ).toList();
    }

    public static Administracao toReferencia ( Long idAdministracao )
    {
        if ( idAdministracao == null )
        {
            return null;
        }

        Administracao administracao = new Administracao();
        administracao.setId( idAdministracao );
        return administracao;
    }
}
