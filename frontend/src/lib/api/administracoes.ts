import { z } from "zod";
import { apiFetch } from "./client";
import { Tournaments } from "@/src/lib/types/tournaments";

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
const paraTournament = (resposta: AdministracaoResponse): Tournaments => ({
    id: resposta.id,
    name: resposta.nome,
    description: resposta.descricao ?? "",
    competitions: [],
});

export const listarAdministracoes = async (): Promise<Tournaments[]> => {
    const resposta = await apiFetch<unknown>("/administracao");
    return z.array(administracaoResponseSchema).parse(resposta).map(paraTournament);
};

export const criarAdministracao = async (entrada: AdministracaoInput): Promise<Tournaments> => {
    const resposta = await apiFetch<unknown>("/administracao", {
        method: "POST",
        body: JSON.stringify(entrada),
    });
    return paraTournament(administracaoResponseSchema.parse(resposta));
};

export const atualizarAdministracao = async (
    id: number,
    entrada: AdministracaoInput,
): Promise<Tournaments> => {
    const resposta = await apiFetch<unknown>(`/administracao/${id}`, {
        method: "PUT",
        body: JSON.stringify({ id, ...entrada }),
    });
    return paraTournament(administracaoResponseSchema.parse(resposta));
};
