import { z } from "zod";

import { apiFetch } from "./client";

/**
 * Sanção tem dois recursos distintos, e a API os separa desde a reorganização
 * do controller:
 *
 * - `/sancao` é a **regra**: quantas partidas de suspensão um tipo de infração
 *   custa naquela competição.
 * - `/sancao_atleta` é a **punição aplicada**: qual atleta está cumprindo, a
 *   partir de qual partida, quantas faltam.
 *
 * Enquanto a entidade `Evento` não existir, a punição é lançada à mão — não há
 * como derivá-la da contagem de cartões, que é o que RF105 e RF106 pedem.
 */

/* ------------------------------------------------------- a regra --------- */

const sancaoResponseSchema = z.object({
    id: z.number(),
    qtdPartidasPadrao: z.number().nullable(),
    tipoEsporte: z.string().nullable(),
    idCompeticao: z.number().nullable(),
});

export type Sancao = {
    id: number;
    partidasPadrao: number;
    tipoEsporte: string;
    idCompeticao?: number;
};

const paraSancao = (r: z.infer<typeof sancaoResponseSchema>): Sancao => ({
    id: r.id,
    partidasPadrao: r.qtdPartidasPadrao ?? 0,
    tipoEsporte: r.tipoEsporte ?? "",
    idCompeticao: r.idCompeticao ?? undefined,
});

export const listarSancoes = async (): Promise<Sancao[]> =>
    z
        .array(sancaoResponseSchema)
        .parse((await apiFetch<unknown>("/sancao")) ?? [])
        .map(paraSancao);

export interface SancaoInput {
    qtdPartidas: number;
    tipoEsporte: string;
    idCompeticao: number;
}

export const criarSancao = async (entrada: SancaoInput): Promise<Sancao> =>
    paraSancao(
        sancaoResponseSchema.parse(
            await apiFetch<unknown>("/sancao", {
                method: "POST",
                body: JSON.stringify(entrada),
            }),
        ),
    );

export const atualizarSancao = async (id: number, entrada: SancaoInput): Promise<Sancao> =>
    paraSancao(
        sancaoResponseSchema.parse(
            await apiFetch<unknown>(`/sancao/${id}`, {
                method: "PUT",
                body: JSON.stringify(entrada),
            }),
        ),
    );

export const removerSancao = async (id: number): Promise<void> => {
    await apiFetch<void>(`/sancao/${id}`, { method: "DELETE" });
};

/* --------------------------------------------- a punição aplicada -------- */

const sancaoAtletaResponseSchema = z.object({
    idSancaoAtleta: z.number(),
    idSancao: z.number().nullable(),
    idAtleta: z.number().nullable(),
    nomeAtleta: z.string().nullable(),
    idPartida: z.number().nullable(),
    justificativa: z.string().nullable(),
    partidasRestantes: z.number().nullable(),
});

export type SancaoDeAtleta = {
    id: number;
    idSancao?: number;
    idAtleta?: number;
    nomeAtleta: string;
    idPartida?: number;
    justificativa: string;
    partidasRestantes: number;
};

const paraSancaoDeAtleta = (
    r: z.infer<typeof sancaoAtletaResponseSchema>,
): SancaoDeAtleta => ({
    id: r.idSancaoAtleta,
    idSancao: r.idSancao ?? undefined,
    idAtleta: r.idAtleta ?? undefined,
    nomeAtleta: r.nomeAtleta ?? "",
    idPartida: r.idPartida ?? undefined,
    justificativa: r.justificativa ?? "",
    partidasRestantes: r.partidasRestantes ?? 0,
});

export const listarSancoesDeAtleta = async (): Promise<SancaoDeAtleta[]> =>
    z
        .array(sancaoAtletaResponseSchema)
        .parse((await apiFetch<unknown>("/sancao_atleta")) ?? [])
        .map(paraSancaoDeAtleta);

export interface SancaoDeAtletaInput {
    idSancao: number;
    idAtleta: number;
    idPartida?: number;
    justificativa?: string;
    exceao?: boolean;
    qtdPartidasExcerssao?: number;
}

export const aplicarSancaoAAtleta = async (
    entrada: SancaoDeAtletaInput,
): Promise<SancaoDeAtleta> =>
    paraSancaoDeAtleta(
        sancaoAtletaResponseSchema.parse(
            await apiFetch<unknown>("/sancao_atleta", {
                method: "POST",
                body: JSON.stringify(entrada),
            }),
        ),
    );

/** Encerra a suspensão sem apagar o registro — é PUT porque muda estado. */
export const inativarSancaoDeAtleta = async (id: number): Promise<void> => {
    await apiFetch<void>(`/sancao_atleta/${id}/inativar`, { method: "PUT" });
};

export const removerSancaoDeAtleta = async (id: number): Promise<void> => {
    await apiFetch<void>(`/sancao_atleta/${id}`, { method: "DELETE" });
};
