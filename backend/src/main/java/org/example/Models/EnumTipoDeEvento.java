package org.example.Models;

/** O que se anota numa súmula de futebol amador: nada de estatística, só acontecimento. */
public enum EnumTipoDeEvento
{
    GOL,
    GOL_CONTRA,
    CARTAO_AMARELO,
    /** O do segundo amarelo. */
    CARTAO_VERMELHO_INDIRETO,
    CARTAO_VERMELHO_DIRETO,
    FALTA_COMETIDA,
    FALTA_SOFRIDA;

    public boolean ehGol ()
    {
        return this == GOL || this == GOL_CONTRA;
    }
}
