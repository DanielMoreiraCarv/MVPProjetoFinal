package org.example.Mapper;

import org.example.Models.Modalidade;
import org.example.Models.Response.ModalidadeResponse;

import java.util.Collections;
import java.util.List;

public class ModalidadeMapper
{
    private ModalidadeMapper ()
    {
    }

    public static ModalidadeResponse toResponse ( Modalidade modalidade )
    {
        if ( modalidade == null )
        {
            return null;
        }

        return new ModalidadeResponse( modalidade.getId(), modalidade.getCodigo(),
                modalidade.getNome(), modalidade.getJogadoresEmQuadra() );
    }

    public static List<ModalidadeResponse> toResponse ( List<Modalidade> modalidades )
    {
        if ( modalidades == null || modalidades.isEmpty() )
        {
            return Collections.emptyList();
        }

        return modalidades.stream().map( ModalidadeMapper::toResponse ).toList();
    }

    /** Referência para o JPA resolver na persistência, sem ir ao banco aqui. */
    public static Modalidade toReferencia ( Long idModalidade )
    {
        if ( idModalidade == null )
        {
            return null;
        }

        Modalidade modalidade = new Modalidade();
        modalidade.setId( idModalidade );
        return modalidade;
    }

    public static List<Modalidade> toReferencias ( List<Long> idsModalidade )
    {
        if ( idsModalidade == null || idsModalidade.isEmpty() )
        {
            return Collections.emptyList();
        }

        return idsModalidade.stream().map( ModalidadeMapper::toReferencia ).toList();
    }
}
