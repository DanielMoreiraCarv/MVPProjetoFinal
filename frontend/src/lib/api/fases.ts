import { z } from "zod";

import { apiFetch } from "./client";

const faseResponseSchema = z.object({
    id: z.number(),
    nome: z.string().nullable(),
    ordem: z.number().nullable(),
    fasePartida: z.string().nullable(),
    qtdClassificados: z.number().nullable(),
    idFaseSucessora: z.number().nullable(),
    quantosEntram: z.number().nullable().optional(),
    quantosAvancam: z.number().nullable().optional(),
});

/** Os três formatos que o motor de fases conhece. */
export const FORMATOS_DE_FASE = ["PONTOS_CORRIDOS", "GRUPOS", "ELIMINATORIA"] as const;

export type FormatoDeFase = (typeof FORMATOS_DE_FASE)[number];

export const ROTULO_DO_FORMATO: Record<FormatoDeFase, string> = {
    PONTOS_CORRIDOS: "Pontos corridos",
    GRUPOS: "Fase de grupos",
    ELIMINATORIA: "Eliminatória",
};

/**
 * O `fasePartida` da resposta não é o nome da constante: o mapeador do
 * servidor devolve `EnumFasePartida.getDescricao()` — "Pontos Corridos",
 * "Grupo", "Eliminatória" — enquanto a requisição espera o nome
 * ("PONTOS_CORRIDOS"). Traduzir aqui é o que impede a tela de ficar com um
 * formato que o rótulo não reconhece e que nenhum seletor consegue marcar.
 */
/**
 * A resposta devolve a mesma constante que o pedido exige — antes devolvia a
 * descrição ("Pontos Corridos") enquanto o POST pedia `PONTOS_CORRIDOS`, e o
 * cliente tinha que traduzir nos dois sentidos para marcar o formato atual num
 * seletor.
 */
const formatoDoTexto = (texto?: string | null): FormatoDeFase | undefined =>
    texto && (FORMATOS_DE_FASE as readonly string[]).includes(texto)
        ? (texto as FormatoDeFase)
        : undefined;

export type Fase = {
    id: number;
    nome: string;
    ordem?: number;
    formato?: FormatoDeFase;
    classificados?: number;
    idFaseSucessora?: number;
    /** Do servidor: quantas entram e quantas avançam, mesmo antes de saber quais. */
    entram?: number;
    avancam?: number;
};

const paraFase = (resposta: z.infer<typeof faseResponseSchema>): Fase => ({
    id: resposta.id,
    nome: resposta.nome ?? "",
    ordem: resposta.ordem ?? undefined,
    formato: formatoDoTexto(resposta.fasePartida),
    classificados: resposta.qtdClassificados ?? undefined,
    idFaseSucessora: resposta.idFaseSucessora ?? undefined,
    entram: resposta.quantosEntram ?? undefined,
    avancam: resposta.quantosAvancam ?? undefined,
});

/** O corpo de `POST /fase` e de `PUT /fase/{id}`. */
export type EntradaDeFase = {
    nome: string;
    ordem: number;
    fasePartida: FormatoDeFase;
    idCompeticao: number;
    qtdClassificados?: number;
    idFaseSucessora?: number;
};

export const criarFase = async (entrada: EntradaDeFase): Promise<Fase> =>
    paraFase(
        faseResponseSchema.parse(
            await apiFetch<unknown>("/fase", {
                method: "POST",
                body: JSON.stringify(entrada),
            }),
        ),
    );

/**
 * O `PUT` substitui a fase inteira: mande sempre todos os campos, porque o
 * que vier ausente é gravado como nulo.
 */
export const atualizarFase = async (id: number, entrada: EntradaDeFase): Promise<Fase> =>
    paraFase(
        faseResponseSchema.parse(
            await apiFetch<unknown>(`/fase/${id}`, {
                method: "PUT",
                body: JSON.stringify({ id, ...entrada }),
            }),
        ),
    );

export const removerFase = async (id: number): Promise<void> => {
    await apiFetch<unknown>(`/fase/${id}`, { method: "DELETE" });
};

/**
 * As fases de uma competição. Sem o filtro esta rota devolve as fases de
 * todas as competições, e peneirar no cliente só funciona enquanto o número
 * de competições é pequeno.
 */
export const listarFasesDaCompeticao = async (idCompeticao: number): Promise<Fase[]> =>
    z
        // Lista vazia volta como corpo vazio: o mapeador do servidor devolve
        // nulo quando não há fase nenhuma, e sem o `?? []` o schema estoura na
        // competição que ainda não tem fase — justamente a primeira que se abre.
        .array(faseResponseSchema)
        .parse((await apiFetch<unknown>(`/fase?idCompeticao=${idCompeticao}`)) ?? [])
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
 * O nome de tela de cada atributo. O servidor publica o código
 * (`numeroDeGrupos`), que é identificador, não rótulo; código que ainda não
 * esteja aqui vira frase a partir do próprio camelCase, para a estratégia
 * nova aparecer legível sem ninguém lembrar de mexer nesta lista.
 */
const ROTULO_DO_ATRIBUTO: Record<string, string> = {
    numeroDeGrupos: "Número de grupos",
    tamanhoDoGrupo: "Equipes por grupo",
    idaEVolta: "Ida e volta",
    permiteGruposDesiguais: "Permitir grupos de tamanhos diferentes",
    criteriosDeDesempate: "Critérios de desempate",
    pontosPorVitoria: "Pontos por vitória",
    pontosPorEmpate: "Pontos por empate",
    pontosPorDerrota: "Pontos por derrota",
    pararEmNTimes: "Equipes ao final",
    desconsiderarEmpatesNaEntrada: "Aceitar empates na entrada",
};

export const rotuloDoAtributo = (codigo: string) =>
    ROTULO_DO_ATRIBUTO[codigo] ??
    codigo
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .replace(/^./, (letra) => letra.toUpperCase());

/** Os critérios que o servidor conhece, na linguagem de quem organiza. */
export const CRITERIOS_DE_DESEMPATE: { codigo: string; rotulo: string }[] = [
    { codigo: "SALDO_GOLS", rotulo: "Saldo de gols" },
    { codigo: "GOLS_PRO", rotulo: "Gols marcados" },
    { codigo: "VITORIAS", rotulo: "Vitórias" },
    { codigo: "MENOS_JOGOS", rotulo: "Menos jogos" },
];

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

/* -------------------------------------- validação, confrontos, tabela ---- */

const validacaoResponseSchema = z.object({
    valido: z.boolean(),
    erros: z.array(z.string()).nullable(),
});

export type ValidacaoDaFase = {
    valido: boolean;
    /** Em linguagem de quem organiza: "um mata-mata precisa de ao menos 2 equipes, recebeu 1". */
    erros: string[];
};

/**
 * O que falta para a fase poder ser montada.
 *
 * Quem decide é o servidor, que conhece a estratégia e a entrada; a tela só
 * mostra a lista. Repetir a regra aqui seria manter duas validações que
 * discordam na primeira mudança de estratégia.
 */
export const validarFase = async (idFase: number): Promise<ValidacaoDaFase> => {
    const resposta = validacaoResponseSchema.parse(
        await apiFetch<unknown>(`/fase/${idFase}/validacao`),
    );

    return { valido: resposta.valido, erros: resposta.erros ?? [] };
};

/**
 * Gera os confrontos da fase, substituindo os que já existiam. Devolve
 * quantos ficaram.
 */
export const gerarConfrontosDaFase = async (idFase: number): Promise<number> => {
    const resposta = await apiFetch<unknown>(`/fase/${idFase}/confrontos`, { method: "POST" });

    return z
        .array(z.unknown())
        .parse(resposta ?? [])
        .length;
};

const classificadoResponseSchema = z.object({
    posicao: z.number().nullable(),
    idEquipe: z.number().nullable(),
    nomeEquipe: z.string().nullable(),
});

/**
 * Uma linha da classificação de uma fase.
 *
 * É só a ordem: posição, equipe e o nome dela. A rota não devolve pontos,
 * jogos, vitórias nem saldo — quem precisa dos números não os tem aqui.
 */
export type Classificado = {
    posicao?: number;
    idEquipe?: number;
    nomeEquipe: string;
};

/**
 * A classificação da fase, calculada no servidor.
 *
 * Vazia enquanto os confrontos não forem gerados: sem partida não há ordem a
 * apurar.
 */
export const listarClassificacaoDaFase = async (idFase: number): Promise<Classificado[]> =>
    z
        .array(classificadoResponseSchema)
        .parse((await apiFetch<unknown>(`/fase/${idFase}/classificacao`)) ?? [])
        .map((r) => ({
            posicao: r.posicao ?? undefined,
            idEquipe: r.idEquipe ?? undefined,
            nomeEquipe: r.nomeEquipe ?? "Equipe sem nome",
        }));

const linhaDaTabelaSchema = z.object({
    grupo: z.number().nullable(),
    posicao: z.number(),
    idEquipe: z.number(),
    nomeEquipe: z.string().nullable(),
    pontos: z.number(),
    jogos: z.number(),
    vitorias: z.number(),
    empates: z.number(),
    derrotas: z.number(),
    golsPro: z.number(),
    golsContra: z.number(),
    saldo: z.number(),
});

export type LinhaDaTabela = Omit<z.infer<typeof linhaDaTabelaSchema>, "nomeEquipe" | "grupo"> & {
    grupo?: number;
    equipe: string;
};

/**
 * A tabela de pontos da fase — grupos e pontos corridos —, com os números
 * calculados no servidor (RNF23) e quem entra na fase já listado e zerado
 * antes do primeiro jogo. A eliminatória não tem tabela: a rota recusa.
 */
export const listarTabelaDaFase = async (idFase: number): Promise<LinhaDaTabela[]> =>
    z
        .array(linhaDaTabelaSchema)
        .parse((await apiFetch<unknown>(`/fase/${idFase}/tabela`)) ?? [])
        .map(({ nomeEquipe, grupo, ...linha }) => ({
            ...linha,
            grupo: grupo ?? undefined,
            equipe: nomeEquipe ?? "Equipe sem nome",
        }));

/** Os formatos que se decidem por pontos e por isso têm tabela. */
export const temTabelaDePontos = (formato?: FormatoDeFase) =>
    formato === "GRUPOS" || formato === "PONTOS_CORRIDOS";

const ladoDaChaveSchema = z.object({
    idEquipe: z.number().nullable(),
    nomeEquipe: z.string().nullable(),
    origem: z.string().nullable(),
});

const chaveamentoSchema = z.object({
    participantes: z.number(),
    pararEm: z.number(),
    etapas: z.array(
        z.object({
            rodada: z.number(),
            nome: z.string(),
            equipes: z.number(),
            confrontos: z.array(
                z.object({
                    jogo: z.number(),
                    alimenta: z.number().nullable(),
                    mandante: ladoDaChaveSchema,
                    visitante: ladoDaChaveSchema,
                    placarMandante: z.number().nullable(),
                    placarVisitante: z.number().nullable(),
                    decidido: z.boolean(),
                    idVencedor: z.number().nullable(),
                    idsDasPartidas: z.array(z.number()),
                }),
            ),
        }),
    ),
});

export type Chaveamento = z.infer<typeof chaveamentoSchema>;
export type EtapaDaChave = Chaveamento["etapas"][number];
export type ConfrontoDaChave = EtapaDaChave["confrontos"][number];
export type LadoDaChave = ConfrontoDaChave["mandante"];

/**
 * A chave da eliminatória, etapa por etapa e já na ordem de desenho — cada
 * par vizinho alimenta o mesmo confronto da etapa seguinte. As etapas que
 * ainda não existem vêm com a origem de cada lado ("Vencedor do jogo 3").
 */
export const buscarChaveamento = async (idFase: number): Promise<Chaveamento> =>
    chaveamentoSchema.parse(await apiFetch<unknown>(`/fase/${idFase}/chaveamento`));
