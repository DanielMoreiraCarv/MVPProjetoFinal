import { z } from "zod";

import { apiFetch } from "./client";

const pessoasSchema = z.object({
    participantes: z.array(
        z.object({ id: z.number(), nome: z.string(), email: z.string(), voce: z.boolean() }),
    ),
    convites: z.array(z.object({ id: z.number(), email: z.string(), criadoEm: z.string() })),
});

export type PessoasDaCompeticao = z.infer<typeof pessoasSchema>;

const pessoas = async (caminho: string, init?: RequestInit) =>
    pessoasSchema.parse(await apiFetch<unknown>(caminho, init));

export const listarPessoas = (idCompeticao: number) => pessoas(`/competicao/${idCompeticao}/pessoas`);

/** Com conta, a pessoa entra na hora; sem conta, o convite espera o cadastro com esse e-mail. */
export const convidarPessoa = (idCompeticao: number, email: string) =>
    pessoas(`/competicao/${idCompeticao}/pessoas`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });

export const removerPessoa = (idCompeticao: number, idUsuario: number) =>
    pessoas(`/competicao/${idCompeticao}/pessoas/${idUsuario}`, { method: "DELETE" });

export const cancelarConvite = (idCompeticao: number, idConvite: number) =>
    pessoas(`/competicao/${idCompeticao}/pessoas/convite/${idConvite}`, { method: "DELETE" });
