import { z } from "zod";
import { apiFetch } from "./client";
import { Administracao } from "@/src/lib/types/administracao";

// Espelha AdministracaoResponse do backend, que fala PT-BR.
const administracaoResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string().nullable(),
});

type AdministracaoResponse = z.infer<typeof administracaoResponseSchema>;

export interface AdministracaoInput {
    nome: string;
    descricao: string;
}

// A API entrega a administração sozinha; as competições vêm de outra rota.
const paraTournament = (resposta: AdministracaoResponse): Administracao => ({
    id: resposta.id,
    nome: resposta.nome,
    descricao: resposta.descricao ?? "",
    competicoes: [],
});

export const listarAdministracoes = async (): Promise<Administracao[]> => {
    const resposta = await apiFetch<unknown>("/administracao");
    return z.array(administracaoResponseSchema).parse(resposta).map(paraTournament);
};

export const criarAdministracao = async (entrada: AdministracaoInput): Promise<Administracao> => {
    const resposta = await apiFetch<unknown>("/administracao", {
        method: "POST",
        body: JSON.stringify(entrada),
    });
    return paraTournament(administracaoResponseSchema.parse(resposta));
};

export const atualizarAdministracao = async (
    id: number,
    entrada: AdministracaoInput,
): Promise<Administracao> => {
    const resposta = await apiFetch<unknown>(`/administracao/${id}`, {
        method: "PUT",
        body: JSON.stringify({ id, ...entrada }),
    });
    return paraTournament(administracaoResponseSchema.parse(resposta));
};
