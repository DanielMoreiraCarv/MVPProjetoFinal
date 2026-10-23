import { z } from "zod";

import { apiFetch } from "./client";

const federacaoResponseSchema = z.object({
    id: z.number(),
    nome: z.string().nullable(),
});

export type Federacao = { id: number; nome: string };

const paraFederacao = (resposta: z.infer<typeof federacaoResponseSchema>): Federacao => ({
    id: resposta.id,
    nome: resposta.nome ?? "",
});

export const listarFederacoes = async (): Promise<Federacao[]> =>
    z
        .array(federacaoResponseSchema)
        .parse(await apiFetch<unknown>("/federacao"))
        .map(paraFederacao);

export const criarFederacao = async (nome: string): Promise<Federacao> =>
    paraFederacao(
        federacaoResponseSchema.parse(
            await apiFetch<unknown>("/federacao", {
                method: "POST",
                body: JSON.stringify({ nome }),
            }),
        ),
    );

export const atualizarFederacao = async (id: number, nome: string): Promise<Federacao> =>
    paraFederacao(
        federacaoResponseSchema.parse(
            await apiFetch<unknown>(`/federacao/${id}`, {
                method: "PUT",
                body: JSON.stringify({ id, nome }),
            }),
        ),
    );

/** Recusado com motivo quando houver equipe vinculada. */
export const removerFederacao = async (id: number): Promise<void> => {
    await apiFetch<void>(`/federacao/${id}`, { method: "DELETE" });
};
