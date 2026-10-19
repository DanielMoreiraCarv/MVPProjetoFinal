import { z } from "zod";
import { Acesso, apiFetch, rotaPara } from "./client";
import { Atleta } from "@/src/lib/types/atleta";
import { Equipe } from "@/src/lib/types/equipe";

const atletaAninhadoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    numCamisa: z.number().nullable(),
    idade: z.number().nullable(),
    cpf: z.string().nullable().optional(),
});

const equipeResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    atletas: z.array(atletaAninhadoSchema).nullable(),
    modalidade: z.object({ id: z.number(), nome: z.string() }).nullable(),
    federacao: z.object({ id: z.number(), nome: z.string().nullable() }).nullable(),
});

type EquipeResponse = z.infer<typeof equipeResponseSchema>;

const paraAtletaDoElenco = (atleta: z.infer<typeof atletaAninhadoSchema>): Atleta => ({
    id: atleta.id,
    nome: atleta.nome,
    numCamisa: atleta.numCamisa ?? undefined,
    idade: atleta.idade ?? undefined,
    cpf: atleta.cpf ?? undefined,
});

const paraEquipe = (resposta: EquipeResponse): Equipe => ({
    id: resposta.id,
    nome: resposta.nome,
    modalidade: {
        id: resposta.modalidade?.id ?? 0,
        nome: resposta.modalidade?.nome ?? "",
    },
    // A federação é opcional no cadastro, então ausente e sem nome são a
    // mesma coisa para a tela: não há federação a mostrar.
    federacao: resposta.federacao?.nome
        ? { id: resposta.federacao.id, nome: resposta.federacao.nome }
        : undefined,
    atletas: (resposta.atletas ?? []).map(paraAtletaDoElenco),
});

export const buscarEquipe = async (id: number): Promise<Equipe> =>
    paraEquipe(equipeResponseSchema.parse(await apiFetch<unknown>(`/equipe/${id}`)));

export const listarEquipes = async (idModalidade?: number): Promise<Equipe[]> => {
    const filtro = idModalidade ? `?idModalidade=${idModalidade}` : "";
    return z
        .array(equipeResponseSchema)
        .parse(await apiFetch<unknown>(`/equipe${filtro}`))
        .map(paraEquipe);
};

export interface EquipeInput {
    nome?: string;
    idModalidade?: number;
    idFederacao?: number;
}

/**
 * Cria a equipe.
 *
 * São duas requisições porque `POST /equipe` monta a entidade sem olhar
 * `idModalidade` — a equipe nasceria sem modalidade, e equipe sem modalidade
 * não entra em competição nenhuma. O `PUT` logo depois é o único caminho que
 * grava a modalidade hoje, e grava a federação junto: a criação devolve a
 * federação só com o id, sem o nome.
 */
export const criarEquipe = async (entrada: EquipeInput): Promise<Equipe> =>
    paraEquipe(
        equipeResponseSchema.parse(
            await apiFetch<unknown>("/equipe", {
                method: "POST",
                body: JSON.stringify(entrada),
            }),
        ),
    );

/**
 * Campo ausente é campo que não muda — o servidor trata assim, então mande só
 * o que mudou. Mandar `nome` junto de uma troca de federação é o que
 * sobrescreve um nome que a pessoa não tocou.
 */
export const atualizarEquipe = async (id: number, entrada: EquipeInput): Promise<Equipe> =>
    paraEquipe(
        equipeResponseSchema.parse(
            await apiFetch<unknown>(`/equipe/${id}`, {
                method: "PUT",
                body: JSON.stringify(entrada),
            }),
        ),
    );

/** Recusado com motivo quando a equipe está vinculada a uma competição. */
export const removerEquipe = async (id: number): Promise<void> => {
    await apiFetch<void>(`/equipe/${id}`, { method: "DELETE" });
};

/**
 * O elenco. A equipe também traz `atletas` aninhados, mas esta rota é a que
 * serve quando só o elenco interessa — e as duas leem a mesma coluna, então
 * não podem discordar.
 */
export const listarElenco = async (idEquipe: number, acesso: Acesso = "gestao"): Promise<Atleta[]> =>
    z
        .array(atletaAninhadoSchema)
        .parse(await apiFetch<unknown>(rotaPara(acesso, `/equipe/${idEquipe}/atleta`)))
        .map(paraAtletaDoElenco);

/** Traz um atleta já cadastrado para a equipe. */
export const adicionarAoElenco = async (idEquipe: number, idAtleta: number): Promise<Equipe> =>
    paraEquipe(
        equipeResponseSchema.parse(
            await apiFetch<unknown>(`/equipe/${idEquipe}/atleta/${idAtleta}`, { method: "POST" }),
        ),
    );

/** Tira o atleta da equipe. Ele continua cadastrado. */
export const removerDoElenco = async (idEquipe: number, idAtleta: number): Promise<Equipe> =>
    paraEquipe(
        equipeResponseSchema.parse(
            await apiFetch<unknown>(`/equipe/${idEquipe}/atleta/${idAtleta}`, { method: "DELETE" }),
        ),
    );
