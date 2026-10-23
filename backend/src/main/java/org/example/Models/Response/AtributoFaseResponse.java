package org.example.Models.Response;

import org.example.Models.EnumTipoDeDado;

/**
 * Um campo de configuração que um tipo de fase aceita.
 *
 * Existe para o formulário de configuração se montar a partir do que a
 * estratégia declara, em vez de ter os campos escritos à mão por tipo — que é
 * exatamente o que o modelo de atributos existe para evitar. Cada estratégia
 * já declara os seus em `atributosSuportados()`; faltava a rota.
 */
public record AtributoFaseResponse(
        String codigo,

        EnumTipoDeDado tipoDado,

        boolean obrigatorio,

        String valorPadrao,

        String descricao,

        /** O valor desta instância de fase, quando a pergunta é sobre uma. */
        String valor
)
{
}
