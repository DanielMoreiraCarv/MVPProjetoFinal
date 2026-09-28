import { z } from "zod";
import { apiFetch } from "./client";
import { Equipe } from "@/src/lib/types/equipe";

const atletaAninhadoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    numCamisa: z.number().nullable(),
    idade: z.number().nullable(),
});

const equipeResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    atletas: z.array(atletaAninhadoSchema).nullable(),
    modalidade: z.object({ id: z.number(), nome: z.string() }).nullable(),
});

type EquipeResponse = z.infer<typeof equipeResponseSchema>;

const paraEquipe = (resposta: EquipeResponse): Equipe => ({
    id: resposta.id,
    nome: resposta.nome,
    modalidade: {
        id: resposta.modalidade?.id ?? 0,
        nome: resposta.modalidade?.nome ?? "",
    },
    atletas: (resposta.atletas ?? []).map((atleta) => ({
        id: atleta.id,
        nome: atleta.nome,
        numCamisa: atleta.numCamisa ?? undefined,
        idade: atleta.idade ?? undefined,
    })),
});

export const buscarEquipe = async (id: number): Promise<Equipe> =>
    paraEquipe(equipeResponseSchema.parse(await apiFetch<unknown>(`/equipe/${id}`)));

export const listarEquipes = async (): Promise<Equipe[]> =>
    z.array(equipeResponseSchema).parse(await apiFetch<unknown>("/equipe")).map(paraEquipe);
