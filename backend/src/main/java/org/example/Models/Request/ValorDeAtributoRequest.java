package org.example.Models.Request;

/**
 * O valor de um campo de configuração de fase, sempre como texto.
 *
 * Texto porque o tipo real é declarado pelo atributo — inteiro, booleano,
 * lista — e a conversão fica em `ConfiguracaoDaFase`, num lugar só. Um corpo
 * tipado por campo exigiria um DTO por tipo de dado.
 */
public record ValorDeAtributoRequest(String valor)
{
}
