import { z } from "zod";
import { apiFetch } from "./client";
import { Player } from "@/src/lib/types/player";

const jogadorResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    idade: z.number().nullable(),
    numCamisa: z.number().nullable(),
    cpf: z.string().nullable(),
});

type JogadorResponse = z.infer<typeof jogadorResponseSchema>;

export interface AtletaInput {
    nome: string;
    idade?: number;
    numCamisa?: number;
    cpf?: string;
    idModalidade?: number;
    idTime: number;
}

const paraPlayer = (resposta: JogadorResponse): Player => ({
    id: resposta.id,
    name: resposta.nome,
    number: resposta.numCamisa ?? undefined,
    age: resposta.idade ?? undefined,
    // suspensão ainda não é derivada de eventos; ver Sancao no backend
    suspended: false,
});

export const listarAtletasDoTime = async (idTime: number): Promise<Player[]> => {
    const resposta = await apiFetch<unknown>(`/jogador?idTime=${idTime}`);
    return z.array(jogadorResponseSchema.passthrough()).parse(resposta).map(paraPlayer);
};

export const criarAtleta = async (entrada: AtletaInput): Promise<Player> => {
    const resposta = await apiFetch<unknown>("/jogador", {
        method: "POST",
        body: JSON.stringify(entrada),
    });
    return paraPlayer(jogadorResponseSchema.passthrough().parse(resposta));
};

export const atualizarAtleta = async (id: number, entrada: AtletaInput): Promise<Player> => {
    const resposta = await apiFetch<unknown>("/jogador", {
        method: "PUT",
        body: JSON.stringify({ id, ...entrada }),
    });
    return paraPlayer(jogadorResponseSchema.passthrough().parse(resposta));
};

export const removerAtleta = async (id: number): Promise<void> => {
    await apiFetch<void>(`/jogador/${id}`, { method: "DELETE" });
};
