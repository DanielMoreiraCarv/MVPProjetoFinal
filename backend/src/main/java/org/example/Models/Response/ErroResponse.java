package org.example.Models.Response;

import java.util.List;

/**
 * O corpo de toda resposta de falha, como `documentos/padrao-api.md` §4
 * determina:
 *
 * <pre>
 * { "erro": { "codigo": "VALIDACAO_FALHOU",
 *             "mensagem": "…",
 *             "detalhes": [ { "campo": "nome", "mensagem": "…" } ] } }
 * </pre>
 *
 * Antes disto a falha chegava ao front como 400 sem corpo, e a tela só tinha
 * como dizer "a requisição falhou". O RNF07 pede mensagem com causa e ação
 * corretiva — é o que `mensagem` carrega, e `detalhes` diz em qual campo.
 */
public record ErroResponse(Erro erro)
{
    public record Erro(String codigo, String mensagem, List<Detalhe> detalhes)
    {
    }

    /** Uma falha atribuível a um campo do corpo enviado. */
    public record Detalhe(String campo, String mensagem)
    {
    }

    public static ErroResponse de(String codigo, String mensagem)
    {
        return new ErroResponse(new Erro(codigo, mensagem, List.of()));
    }

    public static ErroResponse de(String codigo, String mensagem, List<Detalhe> detalhes)
    {
        return new ErroResponse(new Erro(codigo, mensagem, detalhes));
    }
}
