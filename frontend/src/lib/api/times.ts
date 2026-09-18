import { z } from "zod";
import { apiFetch } from "./client";
import { Team } from "@/src/lib/types/team";

const atletaAninhadoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    numCamisa: z.number().nullable(),
    idade: z.number().nullable(),
});

const timeResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    jogadores: z.array(atletaAninhadoSchema).nullable(),
    modalidade: z.object({ id: z.number(), nome: z.string() }).nullable(),
});

type TimeResponse = z.infer<typeof timeResponseSchema>;

const paraTeam = (resposta: TimeResponse): Team => ({
    id: resposta.id,
    name: resposta.nome,
    sport: {
        id: resposta.modalidade?.id ?? 0,
        name: resposta.modalidade?.nome ?? "",
        description: "",
    },
    players: (resposta.jogadores ?? []).map((atleta) => ({
        id: atleta.id,
        name: atleta.nome,
        number: atleta.numCamisa ?? undefined,
        age: atleta.idade ?? undefined,
        suspended: false,
    })),
});

export const buscarTime = async (id: number): Promise<Team> =>
    paraTeam(timeResponseSchema.parse(await apiFetch<unknown>(`/time/${id}`)));

export const listarTimes = async (): Promise<Team[]> =>
    z.array(timeResponseSchema).parse(await apiFetch<unknown>("/time")).map(paraTeam);
