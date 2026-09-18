import { z } from "zod";
import { apiFetch } from "./client";
import { Match } from "@/src/lib/types/match";

const timeAninhadoSchema = z.object({ id: z.number(), nome: z.string() }).nullable();

const partidaResponseSchema = z.object({
    id: z.number(),
    timeMandante: timeAninhadoSchema,
    timeVisitante: timeAninhadoSchema,
    nomeCampeonato: z.string().nullable(),
    idCampeonato: z.number().nullable(),
    vencedor: z.string().nullable(),
    realizada: z.boolean().nullable(),
    fase: z.string().nullable(),
    // o backend formata o placar como "2 x 1"
    resultado: z.string().nullable(),
});

type PartidaResponse = z.infer<typeof partidaResponseSchema>;

const ESTAGIO_POR_FORMATO: Record<string, Match["stageName"]> = {
    PONTOS_CORRIDOS: "Pontos Corridos",
    GRUPOS: "Grupo",
    ELIMINATORIA: "Final",
};

const placar = (resultado: string | null) => {
    const partes = (resultado ?? "").split(" x ").map(Number);
    return partes.length === 2 && partes.every(Number.isFinite) ? partes : [undefined, undefined];
};

const paraMatch = (resposta: PartidaResponse): Match => {
    const [mandante, visitante] = placar(resposta.resultado);

    return {
        id: resposta.id,
        homeTeam: resposta.timeMandante?.nome ?? "A definir",
        awayTeam: resposta.timeVisitante?.nome ?? "A definir",
        homeScore: mandante,
        awayScore: visitante,
        winner: resposta.vencedor ?? undefined,
        // a partida ainda não tem data nem local no modelo
        date: "",
        tournament: "",
        competitionName: resposta.nomeCampeonato ?? "",
        stageName: ESTAGIO_POR_FORMATO[resposta.fase ?? ""] ?? "Pontos Corridos",
        finished: resposta.realizada ?? false,
    };
};

export const listarPartidasDaCompeticao = async (idCampeonato: number): Promise<Match[]> =>
    z.array(partidaResponseSchema)
     .parse(await apiFetch<unknown>(`/partidas/campeonato/${idCampeonato}`))
     .map(paraMatch);

export const buscarPartida = async (id: number): Promise<Match> =>
    paraMatch(partidaResponseSchema.parse(await apiFetch<unknown>(`/partidas/${id}`)));
