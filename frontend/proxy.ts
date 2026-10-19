import { NextRequest, NextResponse } from "next/server";

import { COOKIE_DA_SESSAO, PAINEL, organizadorDaSessao } from "@/src/lib/sessao/sessao";

/** O que qualquer pessoa abre sem entrar: a apresentação, a entrada e o acompanhamento. */
const ehPublico = (caminho: string) =>
    caminho === "/" ||
    caminho === "/entrar" ||
    caminho === "/acompanhar" ||
    caminho.startsWith("/acompanhar/");

/**
 * Checagem otimista: só olha o cookie. A API ainda não exige autenticação,
 * então isto organiza a navegação, mas não protege dado — isso chega com o
 * login de verdade.
 */
export const proxy = (requisicao: NextRequest) => {
    const caminho = requisicao.nextUrl.pathname;
    const autenticado =
        organizadorDaSessao(requisicao.cookies.get(COOKIE_DA_SESSAO)?.value) !== null;

    if (caminho === "/entrar" && autenticado) {
        return NextResponse.redirect(new URL(PAINEL, requisicao.nextUrl));
    }

    if (!ehPublico(caminho) && !autenticado) {
        const entrada = new URL("/entrar", requisicao.nextUrl);
        entrada.searchParams.set("de", caminho + requisicao.nextUrl.search);
        return NextResponse.redirect(entrada);
    }

    return NextResponse.next();
};

export const config = {
    // Fora: arquivos do Next, ícones e qualquer arquivo com extensão em public/.
    matcher: ["/((?!_next/|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
