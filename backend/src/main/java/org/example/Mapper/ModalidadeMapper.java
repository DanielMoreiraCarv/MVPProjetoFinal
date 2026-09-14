package org.example.Mapper;

import org.example.Models.Modalidade;
import org.example.Models.Response.ModalidadeResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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

    /** Mutável de propósito: o Hibernate limpa a coleção ao mesclar na entidade. */
    public static List<Modalidade> toReferencias ( List<Long> idsModalidade )
    {
        if ( idsModalidade == null || idsModalidade.isEmpty() )
        {
            return new ArrayList<>();
        }

        return idsModalidade.stream().map( ModalidadeMapper::toReferencia )
                            .collect( Collectors.toCollection( ArrayList::new ) );
    }
}
