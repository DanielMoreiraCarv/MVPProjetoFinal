package org.example.Models.Response;

/**
 * `categoria` entrava no POST e no PUT, era gravada na coluna e nunca voltava
 * na leitura: a tela não tinha como mostrá-la, e na edição o campo nascia
 * vazio e apagava o valor gravado se ninguém o digitasse de novo.
 */
public record ArbitroResponse(
        Long id,

        String nome,

        String federacao,

        String categoria,

        Integer partidasApitadas
)
{
}
