"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
    RespostaDeAutenticacao,
    chamarAutenticacao,
    cookiesDaSessao,
    cookiesEncerrados,
    mensagemDeErro,
    usuarioDaResposta,
} from "./api";
import { COOKIE_DE_RENOVACAO, destinoSeguro, podeGerir } from "./sessao";

export type EstadoDaEntrada = { erro?: string; email?: string };

/**
 * Entra pela API e guarda a sessão nos cookies httpOnly — os tokens não
 * passam pela página. Quem só tem o papel PUBLICO não entra na gestão: a
 * sessão aberta é encerrada na hora em vez de ficar sobrando.
 */
export const entrar = async (
    _anterior: EstadoDaEntrada,
    formulario: FormData,
): Promise<EstadoDaEntrada> => {
    const email = String(formulario.get("email") ?? "").trim().toLowerCase();
    const senha = String(formulario.get("senha") ?? "");

    if (!email || !senha) {
        return { erro: "Informe o e-mail e a senha.", email };
    }

    let resposta: Response;
    try {
        resposta = await chamarAutenticacao("login", { email, senha });
    } catch {
        return { erro: "Não foi possível falar com o servidor. Tente de novo.", email };
    }

    if (!resposta.ok) {
        // A API já diz o que houve — senha errada, conta bloqueada por
        // tentativas — com a mesma mensagem para e-mail inexistente.
        return { erro: await mensagemDeErro(resposta, "Não foi possível entrar."), email };
    }

    const sessao = (await resposta.json()) as RespostaDeAutenticacao;

    if (!podeGerir(usuarioDaResposta(sessao))) {
        await chamarAutenticacao("sair", { tokenRenovacao: sessao.tokenRenovacao }).catch(() => undefined);
        return {
            erro: "Seu usuário acompanha competições, mas não tem acesso à gestão. Peça a um administrador.",
            email,
        };
    }

    const guardados = await cookies();
    for (const cookie of cookiesDaSessao(sessao)) guardados.set(cookie);

    redirect(destinoSeguro(formulario.get("de")));
};

/** Revoga a renovação no servidor antes de apagar os cookies: sair encerra a sessão, não só a esconde. */
export const sair = async () => {
    const guardados = await cookies();
    const tokenRenovacao = guardados.get(COOKIE_DE_RENOVACAO)?.value;

    if (tokenRenovacao) {
        await chamarAutenticacao("sair", { tokenRenovacao }).catch(() => undefined);
    }

    for (const cookie of cookiesEncerrados()) guardados.set(cookie);
    redirect("/");
};
