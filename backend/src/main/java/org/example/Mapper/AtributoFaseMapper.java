package org.example.Mapper;

import org.example.Models.AtributoFase;
import org.example.Models.Response.AtributoFaseResponse;

public class AtributoFaseMapper
{
    private AtributoFaseMapper ()
    {
    }

    /** O atributo como catálogo: o que o tipo aceita, sem valor de instância. */
    public static AtributoFaseResponse toResponse ( AtributoFase atributo )
    {
        return toResponse( atributo, null );
    }

    public static AtributoFaseResponse toResponse ( AtributoFase atributo, String valor )
    {
        if ( atributo == null )
        {
            return null;
        }

        return new AtributoFaseResponse( atributo.getCodigo(), atributo.getTipoDado(),
                atributo.isObrigatorio(), atributo.getValorPadrao(), atributo.getDescricao(),
                valor );
    }
}
