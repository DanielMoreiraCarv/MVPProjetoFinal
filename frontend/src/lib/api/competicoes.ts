import { z } from "zod";
import { apiFetch } from "./client";
import { Competicao } from "@/src/lib/types/competicao";

const modalidadeAninhadaSchema = z.object({
    id: z.number(),
    nome: z.string().nullable(),
});

const equipeAninhadaSchema = z.object({
    id: z.number(),
    nome: z.string(),
    atletas: z.array(z.object({
        id: z.number(),
        nome: z.string(),
        numCamisa: z.number().nullable(),
        idade: z.number().nullable(),
    })).nullable(),
    modalidade: z.object({ id: z.number(), nome: z.string() }).nullable(),
});

const competicaoResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string().nullable(),
    categoria: z.string().nullable(),
    idAdministracao: z.number().nullable(),
    modalidades: z.array(modalidadeAninhadaSchema).nullable(),
    isMataMata: z.boolean().nullable(),
    equipes: z.array(equipeAninhadaSchema).nullable(),
});

type CompeticaoResponse = z.infer<typeof competicaoResponseSchema>;

export interface CompeticaoInput {
    nome: string;
    descricao: string;
    categoria: string;
    idAdministracao: number;
    modalidadesIds: number[];
    isMataMata: boolean;
}

const paraCompeticao = (resposta: CompeticaoResponse): Competicao => {
    const modalidade = resposta.modalidades?.[0];

    return {
        id: resposta.id,
        nome: resposta.nome,
        descricao: resposta.descricao ?? "",
        modalidade: modalidade?.nome ?? "",
        modalidadeId: modalidade?.id,
        idAdministracao: resposta.idAdministracao ?? undefined,
        equipes: (resposta.equipes ?? []).map((equipe) => ({
            id: equipe.id,
            nome: equipe.nome,
            modalidade: {
                id: equipe.modalidade?.id ?? 0,
                nome: equipe.modalidade?.nome ?? "",
            },
            atletas: (equipe.atletas ?? []).map((atleta) => ({
                id: atleta.id,
                nome: atleta.nome,
                numCamisa: atleta.numCamisa ?? undefined,
                idade: atleta.idade ?? undefined,
            })),
        })),
        isMataMata: resposta.isMataMata ?? false,
        categoria: resposta.categoria ?? "",
    };
};

export const listarCompeticoes = async (idAdministracao?: number): Promise<Competicao[]> => {
    const filtro = idAdministracao ? `?idAdministracao=${idAdministracao}` : "";
    const resposta = await apiFetch<unknown>(`/competicao${filtro}`);
    return z.array(competicaoResponseSchema).parse(resposta).map(paraCompeticao);
};

export const buscarCompeticao = async (id: number): Promise<Competicao> =>
    paraCompeticao(competicaoResponseSchema.parse(await apiFetch<unknown>(`/competicao/${id}`)));

export const criarCompeticao = async (entrada: CompeticaoInput): Promise<Competicao> => {
    const resposta = await apiFetch<unknown>("/competicao", {
        method: "POST",
        body: JSON.stringify(entrada),
    });
    return paraCompeticao(competicaoResponseSchema.parse(resposta));
};

export const atualizarCompeticao = async (
    id: number,
    entrada: CompeticaoInput,
): Promise<Competicao> => {
    const resposta = await apiFetch<unknown>(`/competicao/${id}`, {
        method: "PUT",
        body: JSON.stringify({ id, ...entrada }),
    });
    return paraCompeticao(competicaoResponseSchema.parse(resposta));
};

/**
 * Inscreve uma equipe já existente na competição.
 *
 * O caminho anterior era um PUT com a lista `equipesIds` inteira — leitura,
 * alteração e escrita no cliente, em que duas abas abertas se sobrescreviam e
 * um corpo sem a lista apagava todas as inscrições.
 */
export const inscreverEquipe = async (
    idCompeticao: number,
    idEquipe: number,
): Promise<Competicao> =>
    paraCompeticao(
        competicaoResponseSchema.parse(
            await apiFetch<unknown>(`/competicao/${idCompeticao}/equipe/${idEquipe}`, {
                method: "POST",
            }),
        ),
    );

/** Remove a inscrição. A equipe continua existindo fora da competição. */
export const removerEquipeDaCompeticao = async (
    idCompeticao: number,
    idEquipe: number,
): Promise<Competicao> =>
    paraCompeticao(
        competicaoResponseSchema.parse(
            await apiFetch<unknown>(`/competicao/${idCompeticao}/equipe/${idEquipe}`, {
                method: "DELETE",
            }),
        ),
    );
