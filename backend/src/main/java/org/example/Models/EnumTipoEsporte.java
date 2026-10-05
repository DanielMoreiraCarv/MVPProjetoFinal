package org.example.Models;

import java.util.Arrays;
import java.util.stream.Collectors;

public enum EnumTipoEsporte
{
    BASQUETE( 1, "Basquete" ),
    VOLEI( 2, "Vôlei" ),
    FUTEBOL( 3, "Futebol" );

    private final int id;

    private final String descricao;

    EnumTipoEsporte ( int id, String descricao )
    {
        this.id = id;
        this.descricao = descricao;
    }


    public int getId ()
    {
        return id;
    }

    public String getDescricao ()
    {
        return descricao;
    }

    /** A constante, não a descrição: é o que a resposta devolve e o pedido aceita. */
    public static EnumTipoEsporte deCodigo ( String codigo )
    {
        return Arrays.stream( values() )
                .filter( esporte -> esporte.name().equals( codigo ) )
                .findFirst()
                .orElseThrow( () -> new IllegalArgumentException( "Esporte \"" + codigo
                        + "\" não existe. Use um de: "
                        + Arrays.stream( values() ).map( Enum::name ).collect( Collectors.joining( ", " ) )
                        + "." ) );
    }
}
