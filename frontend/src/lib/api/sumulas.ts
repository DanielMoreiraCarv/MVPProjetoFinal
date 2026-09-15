import { z } from "zod";
import { apiFetch, ApiError } from "./client";
import { Sumula } from "@/src/lib/types/sumula";

const sumulaResponseSchema = z.object({
    id: z.number(),
    arbitro: z.object({ nome: z.string().nullable() }).nullable(),
    golsMandante: z.number().nullable(),
    golsVisitante: z.number().nullable(),
    ocorrencias: z.array(z.string()).nullable(),
    observacoesRelatadas: z.string().nullable(),
    dataFechamento: z.string().nullable(),
    assinada: z.boolean().nullable(),
    idPartida: z.number().nullable(),
});

type SumulaResponse = z.infer<typeof sumulaResponseSchema>;

const paraSumula = (resposta: SumulaResponse, idPartida: number): Sumula => ({
    id: resposta.id,
    matchId: resposta.idPartida ?? idPartida,
    arbitro: resposta.arbitro?.nome ?? "",
    golsMandante: resposta.golsMandante ?? 0,
    golsVisitante: resposta.golsVisitante ?? 0,
    ocorrencias: resposta.ocorrencias ?? [],
    observacoesRelatadas: resposta.observacoesRelatadas ?? "",
    dataFechamento: resposta.dataFechamento ?? undefined,
    assinada: resposta.assinada ?? false,
});

/** Nem toda partida tem súmula: devolve null em vez de estourar no 404. */
export const buscarSumulaDaPartida = async (idPartida: number): Promise<Sumula | null> => {
    try {
        const resposta = await apiFetch<unknown>(`/sumulas/partida/${idPartida}`);
        return paraSumula(sumulaResponseSchema.passthrough().parse(resposta), idPartida);
    } catch (causa) {
        if (causa instanceof ApiError && causa.status === 404) return null;
        throw causa;
    }
};
