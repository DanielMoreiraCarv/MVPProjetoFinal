package org.example.Models;

import java.util.Set;

/**
 * O estado de uma competição (RF18).
 *
 * As transições são explícitas e nenhuma é reversível: uma competição
 * encerrada não volta a estar em andamento, e uma cancelada não ressuscita.
 * Deixar a máquina de estados aqui, e não espalhada em `if` pelos serviços, é
 * o que permite responder "de ENCERRADA não se sai" em um lugar só.
 */
public enum EnumEstadoCompeticao
{
    /** Sendo montada. A estrutura de fases só muda aqui. */
    RASCUNHO,

    /** Publicada e em disputa. */
    EM_ANDAMENTO,

    /** Terminou. Resultado e classificação ficam como estão. */
    ENCERRADA,

    /** Não vai acontecer. */
    CANCELADA;

    private static final java.util.Map<EnumEstadoCompeticao, Set<EnumEstadoCompeticao>> SAIDAS =
            java.util.Map.of(
                    RASCUNHO, Set.of(EM_ANDAMENTO, CANCELADA),
                    EM_ANDAMENTO, Set.of(ENCERRADA, CANCELADA),
                    ENCERRADA, Set.of(),
                    CANCELADA, Set.of());

    public boolean podeIrPara(EnumEstadoCompeticao destino)
    {
        return SAIDAS.get(this).contains(destino);
    }

    public Set<EnumEstadoCompeticao> saidas()
    {
        return SAIDAS.get(this);
    }

    /** Se a estrutura — fases, confrontos — ainda pode ser alterada. */
    public boolean aceitaMudancaDeEstrutura()
    {
        return this == RASCUNHO;
    }

    public boolean estaEncerrada()
    {
        return this == ENCERRADA || this == CANCELADA;
    }
}
