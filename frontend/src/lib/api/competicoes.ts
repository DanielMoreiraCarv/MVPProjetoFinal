import { z } from "zod";
import { Acesso, apiFetch, rotaPara } from "./client";
import { Competicao, EstadoDaCompeticao } from "@/src/lib/types/competicao";

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
    estado: z.string().nullable(),
    equipes: z.array(equipeAninhadaSchema).nullable(),
    publica: z.boolean().nullable().optional(),
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
        estado: (resposta.estado as Competicao["estado"]) ?? undefined,
        publica: resposta.publica ?? false,
    };
};

export const listarCompeticoes = async (idAdministracao?: number): Promise<Competicao[]> => {
    const filtro = idAdministracao ? `?idAdministracao=${idAdministracao}` : "";
    const resposta = await apiFetch<unknown>(`/competicao${filtro}`);
    return z.array(competicaoResponseSchema).parse(resposta).map(paraCompeticao);
};

export const buscarCompeticao = async (id: number, acesso: Acesso = "gestao"): Promise<Competicao> =>
    paraCompeticao(
        competicaoResponseSchema.parse(await apiFetch<unknown>(rotaPara(acesso, `/competicao/${id}`))),
    );

/** As competições abertas ao público, para a vitrine da apresentação. */
export const listarCompeticoesAbertas = async (): Promise<Competicao[]> =>
    z
        .array(competicaoResponseSchema)
        .parse(await apiFetch<unknown>(rotaPara("publico", "/competicao")))
        .map(paraCompeticao);

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
 * Só sai a competição sem partidas, fases nem sanções; com histórico, o
 * servidor recusa e diz para cancelar.
 */
export const removerCompeticao = async (id: number): Promise<void> => {
    await apiFetch<void>(`/competicao/${id}`, { method: "DELETE" });
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

/** Publica, encerra ou cancela (RF18). Transição inválida é recusada com o motivo. */
/** Abre ou fecha a competição ao acompanhamento por link, sem login. */
export const mudarVisibilidadeDaCompeticao = async (
    id: number,
    publica: boolean,
): Promise<Competicao> =>
    paraCompeticao(
        competicaoResponseSchema.parse(
            await apiFetch<unknown>(`/competicao/${id}/visibilidade`, {
                method: "PUT",
                body: JSON.stringify({ publica }),
            }),
        ),
    );

export const mudarEstadoDaCompeticao = async (
    id: number,
    estado: EstadoDaCompeticao,
): Promise<Competicao> =>
    paraCompeticao(
        competicaoResponseSchema.parse(
            await apiFetch<unknown>(`/competicao/${id}/estado`, {
                method: "PUT",
                body: JSON.stringify({ estado }),
            }),
        ),
    );

const estruturaSchema = z.object({
    pronta: z.boolean(),
    partidasGeradas: z.boolean(),
    fases: z.array(
        z.object({
            idFase: z.number(),
            nome: z.string(),
            ordem: z.number().nullable(),
            fasePartida: z.string(),
            quantosEntram: z.number().nullable(),
            quantosAvancam: z.number().nullable(),
            valida: z.boolean(),
            erros: z.array(z.string()),
            partidas: z.number(),
        }),
    ),
});

export type Estrutura = z.infer<typeof estruturaSchema>;
export type FaseDaEstrutura = Estrutura["fases"][number];

/**
 * A estrutura validada fase a fase — inclusive as que só recebem equipes
 * depois, contra a entrada que elas vão ter —, para dizer o que não fecha
 * antes de gerar qualquer partida.
 */
export const buscarEstrutura = async (idCompeticao: number, acesso: Acesso = "gestao"): Promise<Estrutura> =>
    estruturaSchema.parse(
        await apiFetch<unknown>(rotaPara(acesso, `/competicao/${idCompeticao}/estrutura`)),
    );

/**
 * O botão único: valida a estrutura inteira e, se fechar, gera a primeira fase
 * e publica a competição. As seguintes nascem quando a anterior termina.
 */
export const gerarPartidasDaCompeticao = async (idCompeticao: number): Promise<number> =>
    z
        .object({ partidasGeradas: z.number() })
        .parse(await apiFetch<unknown>(`/competicao/${idCompeticao}/partidas`, { method: "POST" }))
        .partidasGeradas;
