import { NextRequest, NextResponse } from "next/server";

import {
    CookieDaSessao,
    cookiesDaSessao,
    cookiesEncerrados,
    renovarSessao,
} from "@/src/lib/sessao/api";
import {
    COOKIE_DE_ACESSO,
    COOKIE_DE_RENOVACAO,
    COOKIE_DO_USUARIO,
    destinoSeguro,
    podeGerir,
    usuarioDoCookie,
} from "@/src/lib/sessao/sessao";

/** O que qualquer pessoa abre sem entrar: a apresentação, a entrada e o acompanhamento. */
const ehPublico = (caminho: string) =>
    caminho === "/" ||
    caminho === "/entrar" ||
    caminho === "/acompanhar" ||
    caminho.startsWith("/acompanhar/");

/**
 * As chamadas à API passam por aqui para renovar a sessão, mas quem decide o
 * acesso a elas é o servidor da API — a resposta 401/403 volta para a tela.
 */
const ehChamadaDaApi = (caminho: string) => caminho.startsWith("/api/");

/**
 * Renova a sessão antes de qualquer coisa: o cookie de acesso sai meio minuto
 * antes do token vencer, e a ausência dele com a renovação presente quer
 * dizer "troque". Os cookies novos vão na resposta, para o navegador, e na
 * própria requisição, para a página e a rota da API já os enxergarem.
 *
 * A checagem de quem pode entrar na gestão é otimista — olha o cookie. A
 * autorização de verdade é da API, a cada chamada.
 */
export const proxy = async (requisicao: NextRequest) => {
    const caminho = requisicao.nextUrl.pathname;
    let novos: CookieDaSessao[] = [];

    const renovacao = requisicao.cookies.get(COOKIE_DE_RENOVACAO)?.value;
    if (!requisicao.cookies.has(COOKIE_DE_ACESSO) && renovacao) {
        const sessao = await renovarSessao(renovacao);
        novos = sessao ? cookiesDaSessao(sessao) : cookiesEncerrados();
        for (const cookie of novos) {
            if (cookie.maxAge > 0) requisicao.cookies.set(cookie.name, cookie.value);
            else requisicao.cookies.delete(cookie.name);
        }
    }

    const usuario = requisicao.cookies.has(COOKIE_DE_ACESSO)
        ? usuarioDoCookie(requisicao.cookies.get(COOKIE_DO_USUARIO)?.value)
        : null;
    const naGestao = podeGerir(usuario);

    let resposta: NextResponse;
    if (caminho === "/entrar" && naGestao) {
        // Já há sessão (talvez recém-renovada): segue para onde a pessoa ia.
        const destino = destinoSeguro(requisicao.nextUrl.searchParams.get("de"));
        resposta = NextResponse.redirect(new URL(destino, requisicao.nextUrl));
    } else if (!ehPublico(caminho) && !ehChamadaDaApi(caminho) && !naGestao) {
        const entrada = new URL("/entrar", requisicao.nextUrl);
        entrada.searchParams.set("de", caminho + requisicao.nextUrl.search);
        resposta = NextResponse.redirect(entrada);
    } else {
        resposta = NextResponse.next({ request: { headers: requisicao.headers } });
    }

    for (const cookie of novos) resposta.cookies.set(cookie);
    return resposta;
};

export const config = {
    // Fora: arquivos do Next, ícones e qualquer arquivo com extensão em public/.
    matcher: ["/((?!_next/|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
