import { z } from "zod";
import { apiFetch } from "./client";
import { Atleta } from "@/src/lib/types/atleta";

const atletaResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    idade: z.number().nullable(),
    numCamisa: z.number().nullable(),
    cpf: z.string().nullable(),
    pontos: z.number().optional(),
    gols: z.number().optional(),
    assistencias: z.number().optional(),
});

type AtletaResponse = z.infer<typeof atletaResponseSchema>;

export interface AtletaInput {
    nome: string;
    idade?: number;
    numCamisa?: number;
    cpf?: string;
    idModalidade?: number;
    idEquipe: number;
}

const paraAtleta = (resposta: AtletaResponse): Atleta => ({
    id: resposta.id,
    nome: resposta.nome,
    numCamisa: resposta.numCamisa ?? undefined,
    idade: resposta.idade ?? undefined,
    pontos: resposta.pontos,
    gols: resposta.gols,
    assistencias: resposta.assistencias,
});

export const listarAtletasDaEquipe = async (idEquipe: number): Promise<Atleta[]> => {
    const resposta = await apiFetch<unknown>(`/atleta?idEquipe=${idEquipe}`);
    return z.array(atletaResponseSchema.passthrough()).parse(resposta).map(paraAtleta);
};

export const criarAtleta = async (entrada: AtletaInput): Promise<Atleta> => {
    const resposta = await apiFetch<unknown>("/atleta", {
        method: "POST",
        body: JSON.stringify(entrada),
    });
    return paraAtleta(atletaResponseSchema.passthrough().parse(resposta));
};

export const atualizarAtleta = async (id: number, entrada: AtletaInput): Promise<Atleta> => {
    const resposta = await apiFetch<unknown>(`/atleta/${id}`, {
        method: "PUT",
        body: JSON.stringify(entrada),
    });
    return paraAtleta(atletaResponseSchema.passthrough().parse(resposta));
};

export const removerAtleta = async (id: number): Promise<void> => {
    await apiFetch<void>(`/atleta/${id}`, { method: "DELETE" });
};
