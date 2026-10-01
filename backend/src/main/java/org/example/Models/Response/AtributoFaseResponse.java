package org.example.Models.Response;

import org.example.Models.EnumTipoDeDado;

/** Um atributo aceito pelo tipo da fase e o valor configurado nela (null quando vale o padrão). */
public record AtributoFaseResponse(
        String codigo,
        EnumTipoDeDado tipoDado,
        boolean obrigatorio,
        String valorPadrao,
        String descricao,
        String valor
)
{
}
