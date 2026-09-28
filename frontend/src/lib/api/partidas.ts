import { z } from "zod";
import { apiFetch } from "./client";
import { FaseNome, Partida } from "@/src/lib/types/partida";

const equipeAninhadaSchema = z.object({ id: z.number(), nome: z.string() }).nullable();

const partidaResponseSchema = z.object({
    id: z.number(),
    equipeMandante: equipeAninhadaSchema,
    equipeVisitante: equipeAninhadaSchema,
    nomeCompeticao: z.string().nullable(),
    idCompeticao: z.number().nullable(),
    vencedor: z.string().nullable(),
    realizada: z.boolean().nullable(),
    fase: z.string().nullable(),
    // o backend formata o placar como "2 x 1"
    resultado: z.string().nullable(),
});

type PartidaResponse = z.infer<typeof partidaResponseSchema>;

// O backend manda o formato da fase, não o estágio da eliminatória: não há
// como saber daqui se uma partida é oitava, quarta ou final. Rotular tudo de
// "Final" era o que fazia toda partida de mata-mata aparecer como decisão.
const FASE_POR_FORMATO: Record<string, FaseNome> = {
    PONTOS_CORRIDOS: "Pontos corridos",
    GRUPOS: "Fase de grupos",
    ELIMINATORIA: "Eliminatória",
};

const placar = (resultado: string | null) => {
    const partes = (resultado ?? "").split(" x ").map(Number);
    return partes.length === 2 && partes.every(Number.isFinite) ? partes : [undefined, undefined];
};

const paraPartida = (resposta: PartidaResponse): Partida => {
    const [mandante, visitante] = placar(resposta.resultado);

    return {
        id: resposta.id,
        equipeMandante: resposta.equipeMandante?.nome ?? "A definir",
        equipeVisitante: resposta.equipeVisitante?.nome ?? "A definir",
        placarMandante: mandante,
        placarVisitante: visitante,
        vencedor: resposta.vencedor ?? undefined,
        nomeCompeticao: resposta.nomeCompeticao ?? "",
        idCompeticao: resposta.idCompeticao ?? 0,
        realizada: resposta.realizada ?? false,
        fase: FASE_POR_FORMATO[resposta.fase ?? ""] ?? "Pontos corridos",
    };
};

export const listarPartidasDaCompeticao = async (idCompeticao: number): Promise<Partida[]> =>
    z.array(partidaResponseSchema)
     .parse(await apiFetch<unknown>(`/partida/competicao/${idCompeticao}`))
     .map(paraPartida);

export const buscarPartida = async (id: number): Promise<Partida> =>
    paraPartida(partidaResponseSchema.parse(await apiFetch<unknown>(`/partida/${id}`)));
