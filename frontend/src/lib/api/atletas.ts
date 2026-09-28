import { z } from "zod";
import { apiFetch } from "./client";
import { Atleta } from "@/src/lib/types/atleta";

const atletaResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    idade: z.number().nullable(),
    numCamisa: z.number().nullable(),
    cpf: z.string().nullable(),
    pontos: z.number().nullable().optional(),
    gols: z.number().nullable().optional(),
    assistencias: z.number().nullable().optional(),
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

/**
 * A atualização sobrescreve todos os campos citados no contrato: o que não
 * for enviado vira nulo, inclusive a modalidade. Então aqui é o formulário
 * inteiro, não só o que mudou — o contrário do que vale para a equipe.
 */
export interface AtletaUpdateInput {
    nome: string;
    idade?: number;
    numCamisa?: number;
    cpf?: string;
    idModalidade?: number;
}

const paraAtleta = (resposta: AtletaResponse): Atleta => ({
    id: resposta.id,
    nome: resposta.nome,
    numCamisa: resposta.numCamisa ?? undefined,
    idade: resposta.idade ?? undefined,
    cpf: resposta.cpf ?? undefined,
    pontos: resposta.pontos ?? undefined,
    gols: resposta.gols ?? undefined,
    assistencias: resposta.assistencias ?? undefined,
});

/**
 * Todos os atletas cadastrados, ou só os de uma equipe.
 *
 * O cadastro é global: atleta existe fora da equipe e pode trocar de equipe.
 * A resposta não diz de qual equipe cada um é — quem precisa disso cruza com
 * `listarEquipes()`, que traz o elenco aninhado.
 */
export const listarAtletas = async (idEquipe?: number): Promise<Atleta[]> => {
    const filtro = idEquipe ? `?idEquipe=${idEquipe}` : "";
    return z
        .array(atletaResponseSchema)
        .parse(await apiFetch<unknown>(`/atleta${filtro}`))
        .map(paraAtleta);
};

export const listarAtletasDaEquipe = (idEquipe: number): Promise<Atleta[]> =>
    listarAtletas(idEquipe);

export const criarAtleta = async (entrada: AtletaInput): Promise<Atleta> => {
    const resposta = await apiFetch<unknown>("/atleta", {
        method: "POST",
        body: JSON.stringify(entrada),
    });
    return paraAtleta(atletaResponseSchema.parse(resposta));
};

export const atualizarAtleta = async (
    id: number,
    entrada: AtletaUpdateInput,
): Promise<Atleta> => {
    const resposta = await apiFetch<unknown>(`/atleta/${id}`, {
        method: "PUT",
        body: JSON.stringify(entrada),
    });
    return paraAtleta(atletaResponseSchema.parse(resposta));
};

/** Apaga o cadastro do atleta. Sair da equipe é `removerDoElenco`. */
export const removerAtleta = async (id: number): Promise<void> => {
    await apiFetch<void>(`/atleta/${id}`, { method: "DELETE" });
};
