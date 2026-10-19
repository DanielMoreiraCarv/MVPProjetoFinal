"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
    COOKIE_DA_SESSAO,
    DURACAO_DA_SESSAO_EM_SEGUNDOS,
    ORGANIZADOR_DE_DEMONSTRACAO,
    destinoSeguro,
} from "./sessao";

export type EstadoDaEntrada = { erro?: string; email?: string };

const normalizarEmail = (valor: FormDataEntryValue | null) =>
    String(valor ?? "").trim().toLowerCase();

export const entrar = async (
    _anterior: EstadoDaEntrada,
    formulario: FormData,
): Promise<EstadoDaEntrada> => {
    const email = normalizarEmail(formulario.get("email"));
    const senha = String(formulario.get("senha") ?? "");

    if (!email || !senha) {
        return { erro: "Informe o e-mail e a senha.", email };
    }

    if (email !== ORGANIZADOR_DE_DEMONSTRACAO.email || senha !== ORGANIZADOR_DE_DEMONSTRACAO.senha) {
        return { erro: "E-mail ou senha não conferem.", email };
    }

    (await cookies()).set(COOKIE_DA_SESSAO, email, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: DURACAO_DA_SESSAO_EM_SEGUNDOS,
    });

    redirect(destinoSeguro(formulario.get("de")));
};

export const sair = async () => {
    (await cookies()).delete(COOKIE_DA_SESSAO);
    redirect("/");
};
