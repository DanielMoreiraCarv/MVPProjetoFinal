import { z } from "zod";

import { apiFetch, ApiError } from "./client";
import { Sumula } from "@/src/lib/types/sumula";

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
export const abrirSumula = async (idPartida: number, idArbitro?: number): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>("/sumula", {
                method: "POST",
                body: JSON.stringify({ idPartida, idArbitro }),
            }),
        ),
        idPartida,
    );

export const registrarOcorrencia = async (
    idSumula: number,
    ocorrencia: string,
    idPartida: number,
): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>(`/sumula/${idSumula}/ocorrencia`, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: ocorrencia,
            }),
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

/** Guarda placar e observações sem assinar: a súmula continua aberta. */
export const salvarSumula = async (
    idSumula: number,
    placarMandante: number,
    placarVisitante: number,
    observacoes: string,
    idPartida: number,
): Promise<Sumula> =>
    paraSumula(
        sumulaResponseSchema.passthrough().parse(
            await apiFetch<unknown>(`/sumula/${idSumula}`, {
                method: "PUT",
                body: JSON.stringify({ placarMandante, placarVisitante, observacoes }),
            }),
        ),
        idPartida,
    );

export const removerSumula = async (idSumula: number): Promise<void> => {
    await apiFetch<void>(`/sumula/${idSumula}`, { method: "DELETE" });
};
