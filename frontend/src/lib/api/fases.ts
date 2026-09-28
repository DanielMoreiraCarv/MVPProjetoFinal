import { z } from "zod";

import { apiFetch } from "./client";

const faseResponseSchema = z.object({
    id: z.number(),
    nome: z.string().nullable(),
    ordem: z.number().nullable(),
    fasePartida: z.string().nullable(),
    qtdClassificados: z.number().nullable(),
    idFaseSucessora: z.number().nullable(),
});

/** Os três formatos que o motor de fases conhece. */
export const FORMATOS_DE_FASE = ["PONTOS_CORRIDOS", "GRUPOS", "ELIMINATORIA"] as const;

export type FormatoDeFase = (typeof FORMATOS_DE_FASE)[number];

export const ROTULO_DO_FORMATO: Record<FormatoDeFase, string> = {
    PONTOS_CORRIDOS: "Pontos corridos",
    GRUPOS: "Fase de grupos",
    ELIMINATORIA: "Eliminatória",
};

export type Fase = {
    id: number;
    nome: string;
    ordem?: number;
    formato?: string;
    classificados?: number;
    idFaseSucessora?: number;
};

const paraFase = (resposta: z.infer<typeof faseResponseSchema>): Fase => ({
    id: resposta.id,
    nome: resposta.nome ?? "",
    ordem: resposta.ordem ?? undefined,
    formato: resposta.fasePartida ?? undefined,
    classificados: resposta.qtdClassificados ?? undefined,
    idFaseSucessora: resposta.idFaseSucessora ?? undefined,
});

/**
 * As fases de uma competição. Sem o filtro esta rota devolve as fases de
 * todas as competições, e peneirar no cliente só funciona enquanto o número
 * de competições é pequeno.
 */
export const listarFasesDaCompeticao = async (idCompeticao: number): Promise<Fase[]> =>
    z
        .array(faseResponseSchema)
        .parse(await apiFetch<unknown>(`/fase?idCompeticao=${idCompeticao}`))
        .map(paraFase);

/* ------------------------------------------------ atributos de fase ------ */

export type TipoDeDado = "TEXTO" | "INTEIRO" | "BOOLEANO" | "LISTA_DE_TEXTO" | "DECIMAL";

const atributoResponseSchema = z.object({
    codigo: z.string(),
    tipoDado: z.string(),
    obrigatorio: z.boolean(),
    valorPadrao: z.string().nullable(),
    descricao: z.string().nullable(),
    valor: z.string().nullable(),
});

export type AtributoDeFase = {
    codigo: string;
    tipoDado: TipoDeDado;
    obrigatorio: boolean;
    valorPadrao?: string;
    descricao?: string;
    valor?: string;
};

const paraAtributo = (r: z.infer<typeof atributoResponseSchema>): AtributoDeFase => ({
    codigo: r.codigo,
    tipoDado: r.tipoDado as TipoDeDado,
    obrigatorio: r.obrigatorio,
    valorPadrao: r.valorPadrao ?? undefined,
    descricao: r.descricao ?? undefined,
    valor: r.valor ?? undefined,
});

/**
 * Os campos que um tipo de fase aceita.
 *
 * É a partir disto que o formulário de configuração se monta: cada estratégia
 * do servidor declara os seus atributos, com tipo, obrigatoriedade, valor
 * padrão e descrição. Escrever os campos à mão por tipo na tela seria manter
 * duas listas que divergem na primeira estratégia nova.
 */
export const listarAtributosDoTipo = async (
    tipoFase: FormatoDeFase,
): Promise<AtributoDeFase[]> =>
    z
        .array(atributoResponseSchema)
        .parse(await apiFetch<unknown>(`/fase/atributo?tipoFase=${tipoFase}`))
        .map(paraAtributo);

/** Os campos do tipo desta fase, já com o valor que ela tem em cada um. */
export const listarAtributosDaFase = async (idFase: number): Promise<AtributoDeFase[]> =>
    z
        .array(atributoResponseSchema)
        .parse(await apiFetch<unknown>(`/fase/${idFase}/atributo`))
        .map(paraAtributo);

export const definirAtributoDaFase = async (
    idFase: number,
    codigo: string,
    valor: string,
): Promise<AtributoDeFase[]> =>
    z
        .array(atributoResponseSchema)
        .parse(
            await apiFetch<unknown>(`/fase/${idFase}/atributo/${codigo}`, {
                method: "PUT",
                body: JSON.stringify({ valor }),
            }),
        )
        .map(paraAtributo);
