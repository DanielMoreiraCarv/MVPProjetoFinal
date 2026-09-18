import { z } from "zod";
import { apiFetch } from "./client";
import { Competition } from "@/src/lib/types/competition";

const modalidadeAninhadaSchema = z.object({
    id: z.number(),
    nome: z.string().nullable(),
});

const timeAninhadoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    jogadores: z.array(z.object({
        id: z.number(),
        nome: z.string(),
        numCamisa: z.number().nullable(),
        idade: z.number().nullable(),
    })).nullable(),
    modalidade: z.object({ id: z.number(), nome: z.string() }).nullable(),
});

const campeonatoResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string().nullable(),
    categoria: z.string().nullable(),
    idAdministracao: z.number().nullable(),
    modalidades: z.array(modalidadeAninhadaSchema).nullable(),
    isMataMata: z.boolean().nullable(),
    lstTimes: z.array(timeAninhadoSchema).nullable(),
});

type CampeonatoResponse = z.infer<typeof campeonatoResponseSchema>;

export interface CompeticaoInput {
    nome: string;
    descricao: string;
    categoria: string;
    idAdministracao: number;
    modalidadesIds: number[];
    isMataMata: boolean;
}

const paraCompetition = (resposta: CampeonatoResponse): Competition => {
    const modalidade = resposta.modalidades?.[0];

    return {
        id: resposta.id,
        name: resposta.nome,
        description: resposta.descricao ?? "",
        sport: modalidade?.nome ?? "",
        modalidadeId: modalidade?.id,
        modality: resposta.categoria ?? "",
        administracaoId: resposta.idAdministracao ?? undefined,
        teams: (resposta.lstTimes ?? []).map((time) => ({
            id: time.id,
            name: time.nome,
            sport: {
                id: time.modalidade?.id ?? 0,
                name: time.modalidade?.nome ?? "",
                description: "",
            },
            players: (time.jogadores ?? []).map((atleta) => ({
                id: atleta.id,
                name: atleta.nome,
                number: atleta.numCamisa ?? undefined,
                age: atleta.idade ?? undefined,
                suspended: false,
            })),
        })),
        currentStage: resposta.isMataMata ? undefined : "Pontos Corridos",
    };
};

export const listarCompeticoes = async (idAdministracao?: number): Promise<Competition[]> => {
    const filtro = idAdministracao ? `?idAdministracao=${idAdministracao}` : "";
    const resposta = await apiFetch<unknown>(`/campeonato${filtro}`);
    return z.array(campeonatoResponseSchema).parse(resposta).map(paraCompetition);
};

export const buscarCompeticao = async (id: number): Promise<Competition> =>
    paraCompetition(campeonatoResponseSchema.parse(await apiFetch<unknown>(`/campeonato/${id}`)));

export const criarCompeticao = async (entrada: CompeticaoInput): Promise<Competition> => {
    const resposta = await apiFetch<unknown>("/campeonato", {
        method: "POST",
        body: JSON.stringify(entrada),
    });
    return paraCompetition(campeonatoResponseSchema.parse(resposta));
};

export const atualizarCompeticao = async (
    id: number,
    entrada: CompeticaoInput,
): Promise<Competition> => {
    const resposta = await apiFetch<unknown>(`/campeonato/${id}`, {
        method: "PUT",
        body: JSON.stringify({ id, ...entrada }),
    });
    return paraCompetition(campeonatoResponseSchema.parse(resposta));
};
