package org.example.Models;

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
    }
