import { z } from "zod";

import { apiFetch, ApiError } from "./client";
import { ModoDaSumula, Sumula, TIPOS_DE_EVENTO, TipoDeEvento } from "@/src/lib/types/sumula";

const sumulaResponseSchema = z.object({
    id: z.number(),
    partida: z.object({ id: z.number() }).nullable(),
    arbitro: z.object({ nome: z.string().nullable() }).nullable(),
    placarMandante: z.number().nullable(),
    placarVisitante: z.number().nullable(),
    ocorrencias: z.array(z.string()).nullable(),
    // Era uma lista de um elemento só, que o cliente tinha que desembrulhar.
    observacoes: z.string().nullable(),
    dataFechamento: z.string().nullable(),
    assinada: z.boolean().nullable(),
    modo: z.enum(["SIMPLIFICADA", "COMPLETA"]).nullable(),
    eventos: z
        .array(
            z.object({
                id: z.number(),
                idAtleta: z.number(),
                nomeAtleta: z.string().nullable(),
                numCamisa: z.number().nullable(),
                idEquipe: z.number(),
                tipo: z.enum(TIPOS_DE_EVENTO),
                automatico: z.boolean(),
                registradoEm: z.string(),
            }),
        )
        .nullable(),
});

type SumulaResponse = z.infer<typeof sumulaResponseSchema>;

// A conversão que sobra não renomeia campo: só resolve nulo e achata o
// árbitro e a partida, dos quais a tela usa um campo só.
const paraSumula = (resposta: SumulaResponse, idPartida: number): Sumula => ({
    id: resposta.id,
    idPartida: resposta.partida?.id ?? idPartida,
    arbitro: resposta.arbitro?.nome ?? "",
    placarMandante: resposta.placarMandante ?? 0,
    placarVisitante: resposta.placarVisitante ?? 0,
    ocorrencias: resposta.ocorrencias ?? [],
    observacoes: resposta.observacoes ?? "",
    dataFechamento: resposta.dataFechamento ?? undefined,
    assinada: resposta.assinada ?? false,
    modo: resposta.modo ?? "COMPLETA",
    eventos: (resposta.eventos ?? []).map((evento) => ({
        ...evento,
        nomeAtleta: evento.nomeAtleta ?? "Atleta sem nome",
        numCamisa: evento.numCamisa ?? undefined,
    })),
});

/** Nem toda partida tem súmula: devolve null em vez de estourar no 404. */
export const buscarSumulaDaPartida = async (idPartida: number): Promise<Sumula | null> => {
    try {
        const resposta = await apiFetch<unknown>(`/sumula/partida/${idPartida}`);
        return paraSumula(sumulaResponseSchema.passthrough().parse(resposta), idPartida);
    } catch (causa) {
        if (causa instanceof ApiError && causa.status === 404) return null;
        throw causa;
    }
};

/** Abre a súmula da partida. Herda o árbitro escalado quando não se informa. */
export const abrirSumula = async (
    idPartida: number,
    modo: ModoDaSumula = "COMPLETA",
    idArbitro?: number,
): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>("/sumula", {
                method: "POST",
                body: JSON.stringify({ idPartida, idArbitro, modo }),
            }),
        ),
        idPartida,
    );

const atualizar = async (idSumula: number, idPartida: number, corpo: object): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>(`/sumula/${idSumula}`, {
                method: "PUT",
                body: JSON.stringify(corpo),
            }),
        ),
        idPartida,
    );

/** O placar direto, para o gol de que ninguém sabe o autor. */
export const definirPlacarDaSumula = (
    idSumula: number,
    idPartida: number,
    placarMandante: number,
    placarVisitante: number,
) => atualizar(idSumula, idPartida, { placarMandante, placarVisitante });

export const definirModoDaSumula = (idSumula: number, idPartida: number, modo: ModoDaSumula) =>
    atualizar(idSumula, idPartida, { modo });

export const definirObservacoesDaSumula = (idSumula: number, idPartida: number, observacoes: string) =>
    atualizar(idSumula, idPartida, { observacoes });

/** Gol mexe no placar da equipe; gol contra no do adversário; o segundo amarelo traz o vermelho. */
export const registrarEvento = async (
    idSumula: number,
    idPartida: number,
    idAtleta: number,
    tipo: TipoDeEvento,
): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>(`/sumula/${idSumula}/evento`, {
                method: "POST",
                body: JSON.stringify({ idAtleta, tipo }),
            }),
        ),
        idPartida,
    );

export const removerEvento = async (
    idSumula: number,
    idPartida: number,
    idEvento: number,
): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>(`/sumula/${idSumula}/evento/${idEvento}`, { method: "DELETE" }),
        ),
        idPartida,
    );

export const encerrarSumula = async (
    idSumula: number,
    placarMandante: number,
    placarVisitante: number,
    observacoes: string,
    idPartida: number,
): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>(`/sumula/${idSumula}/finalizar`, {
                method: "POST",
                body: JSON.stringify({ placarMandante, placarVisitante, observacoes }),
            }),
        ),
        idPartida,
    );

export const removerSumula = async (idSumula: number): Promise<void> => {
    await apiFetch<void>(`/sumula/${idSumula}`, { method: "DELETE" });
};
