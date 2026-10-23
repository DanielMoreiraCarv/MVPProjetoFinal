import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { API_URL } from "@/src/lib/sessao/api";
import { COOKIE_DE_ACESSO } from "@/src/lib/sessao/sessao";

const erro = (status: number, codigo: string, mensagem: string) =>
    Response.json({ erro: { codigo, mensagem, detalhes: [] } }, { status });

/** Escrita só do próprio site: com o token no cookie, o navegador o anexaria a um pedido forjado. */
const mesmaOrigem = (requisicao: NextRequest) => {
    const origem = requisicao.headers.get("origin");
    return origem !== null && origem === requisicao.nextUrl.origin;
};

/**
 * O navegador fala com a API por aqui. O token sai do cookie httpOnly e vai
 * no `Authorization` — o JavaScript da página nunca o vê.
 *
 * As rotas de /auth ficam de fora: login e renovação devolvem tokens no
 * corpo, e quem cuida da sessão são as ações do servidor, que guardam esses
 * tokens nos cookies sem passá-los à página.
 */
const encaminhar = async (
    requisicao: NextRequest,
    { params }: { params: Promise<{ caminho: string[] }> },
) => {
    const { caminho } = await params;

    if (caminho[0] === "auth") {
        return erro(404, "NAO_ENCONTRADO", "Rota não encontrada.");
    }

    const leitura = requisicao.method === "GET" || requisicao.method === "HEAD";
    if (!leitura && !mesmaOrigem(requisicao)) {
        return erro(403, "ORIGEM_RECUSADA", "Pedido de outra origem recusado.");
    }

    const cabecalhos = new Headers({ Accept: "application/json" });
    const tipo = requisicao.headers.get("content-type");
    if (tipo) cabecalhos.set("Content-Type", tipo);
    const acesso = (await cookies()).get(COOKIE_DE_ACESSO)?.value;
    if (acesso) cabecalhos.set("Authorization", `Bearer ${acesso}`);

    let resposta: Response;
    try {
        resposta = await fetch(
            `${API_URL}/${caminho.map(encodeURIComponent).join("/")}${requisicao.nextUrl.search}`,
            {
                method: requisicao.method,
                headers: cabecalhos,
                body: leitura ? undefined : await requisicao.arrayBuffer(),
                cache: "no-store",
                redirect: "manual",
            },
        );
    } catch {
        return erro(502, "API_INDISPONIVEL", "Não foi possível falar com o servidor. Tente de novo.");
    }

    // A API recusou um token que o cookie ainda guardava (segredo trocado,
    // usuário desativado, senha alterada). Sem o cookie, a próxima navegação
    // tenta renovar — ou leva à entrada — em vez de insistir no mesmo token.
    if (resposta.status === 401 && acesso) {
        (await cookies()).delete(COOKIE_DE_ACESSO);
    }

    const devolvidos = new Headers();
    const tipoDaResposta = resposta.headers.get("content-type");
    if (tipoDaResposta) devolvidos.set("Content-Type", tipoDaResposta);

    return new Response(resposta.body, { status: resposta.status, headers: devolvidos });
};

export { encaminhar as GET, encaminhar as POST, encaminhar as PUT, encaminhar as PATCH, encaminhar as DELETE };
