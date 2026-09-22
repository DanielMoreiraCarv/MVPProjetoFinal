package org.example.Fases;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Resultado de validar uma fase antes de configurá-la. */
public record ResultadoDaValidacao(List<String> erros)
{
    public static ResultadoDaValidacao valido ()
    {
        return new ResultadoDaValidacao( Collections.emptyList() );
    }

    public static ResultadoDaValidacao com ( String... erros )
    {
        return new ResultadoDaValidacao( List.of( erros ) );
    }

    public boolean ehValido ()
    {
        return erros.isEmpty();
    }

    public ResultadoDaValidacao mais ( ResultadoDaValidacao outro )
    {
        List<String> juntos = new ArrayList<>( this.erros );
        juntos.addAll( outro.erros() );
        return new ResultadoDaValidacao( juntos );
    }

    public String mensagem ()
    {
        return String.join( "; ", erros );
    }
}
