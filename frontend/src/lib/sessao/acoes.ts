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
import { COOKIE_DE_RENOVACAO, PAINEL, destinoSeguro, podeGerir } from "./sessao";

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

export type EstadoDoCadastro = {
    erro?: string;
    /** A mensagem da API para cada campo — senha fraca, e-mail já usado. */
    campos?: Partial<Record<"nome" | "email" | "senha", string>>;
    nome?: string;
    email?: string;
};

/**
 * Cria a conta e já entra: quem se cadastra organiza as próprias
 * competições. Sem verificação de e-mail, por escolha de escopo.
 */
export const criarConta = async (
    _anterior: EstadoDoCadastro,
    formulario: FormData,
): Promise<EstadoDoCadastro> => {
    const nome = String(formulario.get("nome") ?? "").trim();
    const email = String(formulario.get("email") ?? "").trim().toLowerCase();
    const senha = String(formulario.get("senha") ?? "");

    let resposta: Response;
    try {
        resposta = await chamarAutenticacao("cadastro", { nome, email, senha });
    } catch {
        return { erro: "Não foi possível falar com o servidor. Tente de novo.", nome, email };
    }

    if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        const campos: EstadoDoCadastro["campos"] = {};
        for (const detalhe of corpo?.erro?.detalhes ?? []) {
            if (detalhe?.campo === "nome" || detalhe?.campo === "email" || detalhe?.campo === "senha") {
                campos[detalhe.campo as "nome" | "email" | "senha"] ??= detalhe.mensagem;
            }
        }
        return {
            erro: Object.keys(campos).length > 0 ? undefined : (corpo?.erro?.mensagem ?? "Não foi possível criar a conta."),
            campos,
            nome,
            email,
        };
    }

    const sessao = (await resposta.json()) as RespostaDeAutenticacao;
    const guardados = await cookies();
    for (const cookie of cookiesDaSessao(sessao)) guardados.set(cookie);

    redirect(PAINEL);
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
