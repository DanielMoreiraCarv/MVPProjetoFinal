import { z } from "zod";

import { apiFetch } from "./client";

const faseResponseSchema = z.object({
    id: z.number(),
    nome: z.string().nullable(),
    ordem: z.number().nullable(),
    fasePartida: z.string().nullable(),
    qtdClassificados: z.number().nullable(),
    idFaseSucessora: z.number().nullable(),
});

export type Fase = {
    id: number;
    nome: string;
    ordem?: number;
    formato?: string;
    classificados?: number;
    idFaseSucessora?: number;
};

const paraFase = (resposta: z.infer<typeof faseResponseSchema>): Fase => ({
    id: resposta.id,
    nome: resposta.nome ?? "",
    ordem: resposta.ordem ?? undefined,
    formato: resposta.fasePartida ?? undefined,
    classificados: resposta.qtdClassificados ?? undefined,
    idFaseSucessora: resposta.idFaseSucessora ?? undefined,
});

/**
 * As fases de uma competição. Sem o filtro esta rota devolve as fases de
 * todas as competições, e peneirar no cliente só funciona enquanto o número
 * de competições é pequeno.
 */
export const listarFasesDaCompeticao = async (idCompeticao: number): Promise<Fase[]> =>
    z
        .array(faseResponseSchema)
        .parse(await apiFetch<unknown>(`/fase?idCompeticao=${idCompeticao}`))
        .map(paraFase);
