import { z } from "zod";

import { apiFetch } from "./client";
import { FaseNome, Partida } from "@/src/lib/types/partida";

const equipeResumoSchema = z.object({ id: z.number(), nome: z.string() }).nullable();

const partidaResponseSchema = z.object({
    id: z.number(),
    equipeMandante: equipeResumoSchema,
    equipeVisitante: equipeResumoSchema,
    nomeCompeticao: z.string().nullable(),
    idCompeticao: z.number().nullable(),
    vencedor: z.string().nullable(),
    realizada: z.boolean().nullable(),
    fase: z.string().nullable(),
    arbitro: z.object({ nome: z.string().nullable() }).nullable(),
    placarMandante: z.number().nullable(),
    placarVisitante: z.number().nullable(),
    dataHora: z.string().nullable(),
    local: z.string().nullable(),
});

type PartidaResponse = z.infer<typeof partidaResponseSchema>;

// O backend manda o formato da fase, não o estágio da eliminatória: não há
// como saber daqui se uma partida é oitava, quarta ou final.
const FASE_POR_FORMATO: Record<string, FaseNome> = {
    PONTOS_CORRIDOS: "Pontos corridos",
    GRUPOS: "Fase de grupos",
    ELIMINATORIA: "Eliminatória",
};

const paraPartida = (resposta: PartidaResponse): Partida => ({
    id: resposta.id,
    equipeMandante: resposta.equipeMandante?.nome ?? "A definir",
    idEquipeMandante: resposta.equipeMandante?.id,
    equipeVisitante: resposta.equipeVisitante?.nome ?? "A definir",
    idEquipeVisitante: resposta.equipeVisitante?.id,
    // Números, direto: o servidor mandava "2 x 1" e o cliente partia a string
    // ao meio para recuperar dois inteiros que ele já tinha.
    placarMandante: resposta.placarMandante ?? undefined,
    placarVisitante: resposta.placarVisitante ?? undefined,
    vencedor: resposta.vencedor ?? undefined,
    nomeCompeticao: resposta.nomeCompeticao ?? "",
    idCompeticao: resposta.idCompeticao ?? 0,
    realizada: resposta.realizada ?? false,
    fase: FASE_POR_FORMATO[resposta.fase ?? ""] ?? "Pontos corridos",
    arbitro: resposta.arbitro?.nome ?? undefined,
    dataHora: resposta.dataHora ?? undefined,
    local: resposta.local ?? undefined,
});

export interface PartidaInput {
    idCompeticao: number;
    idEquipeMandante: number;
    idEquipeVisitante: number;
    idFase?: number;
    idArbitro?: number;
    dataHora?: string;
    local?: string;
}

export const listarPartidasDaCompeticao = async (idCompeticao: number): Promise<Partida[]> =>
    z.array(partidaResponseSchema)
     .parse(await apiFetch<unknown>(`/partida/competicao/${idCompeticao}`))
     .map(paraPartida);

export const listarPartidasDaEquipe = async (idEquipe: number): Promise<Partida[]> =>
    z.array(partidaResponseSchema)
     .parse(await apiFetch<unknown>(`/partida/equipe/${idEquipe}`))
     .map(paraPartida);

export const buscarPartida = async (id: number): Promise<Partida> =>
    paraPartida(partidaResponseSchema.parse(await apiFetch<unknown>(`/partida/${id}`)));

export const criarPartida = async (entrada: PartidaInput): Promise<Partida> =>
    paraPartida(
        partidaResponseSchema.parse(
            await apiFetch<unknown>("/partida", {
                method: "POST",
                body: JSON.stringify(entrada),
            }),
        ),
    );

/** Marca dia, hora e lugar (RF58). `dataHora` em ISO-8601 com fuso. */
export const agendarPartida = async (
    id: number,
    dataHora: string,
    local?: string,
): Promise<Partida> =>
    paraPartida(
        partidaResponseSchema.parse(
            await apiFetch<unknown>(`/partida/${id}/agendamento`, {
                method: "PUT",
                body: JSON.stringify({ dataHora, local }),
            }),
        ),
    );

export const atualizarPlacar = async (
    id: number,
    placarMandante: number,
    placarVisitante: number,
): Promise<Partida> =>
    paraPartida(
        partidaResponseSchema.parse(
            await apiFetch<unknown>(
                `/partida/${id}/placar?placarMandante=${placarMandante}&placarVisitante=${placarVisitante}`,
                { method: "PUT" },
            ),
        ),
    );

export const escalarArbitro = async (id: number, idArbitro: number): Promise<Partida> =>
    paraPartida(
        partidaResponseSchema.parse(
            await apiFetch<unknown>(`/partida/${id}/escalar-arbitro?idArbitro=${idArbitro}`, {
                method: "PUT",
            }),
        ),
    );

export const finalizarPartida = async (id: number): Promise<Partida> =>
    paraPartida(
        partidaResponseSchema.parse(
            await apiFetch<unknown>(`/partida/${id}/finalizar`, { method: "POST" }),
        ),
    );

/** Campo ausente não muda: o servidor aplica só o que veio. */
export const atualizarPartida = async (
    id: number,
    entrada: Partial<PartidaInput>,
): Promise<Partida> =>
    paraPartida(
        partidaResponseSchema.parse(
            await apiFetch<unknown>(`/partida/${id}`, {
                method: "PUT",
                body: JSON.stringify(entrada),
            }),
        ),
    );

export const removerPartida = async (id: number): Promise<void> => {
    await apiFetch<void>(`/partida/${id}`, { method: "DELETE" });
};
