import { FormatoDeFase } from "@/src/lib/api/fases";

/**
 * Pontos de partida para montar uma competição.
 *
 * Não são formatos fechados: criam as fases já encadeadas e configuradas, e
 * daí em diante tudo é editável. Começar de uma folha em branco exige decidir
 * de uma vez quantas fases, de que tipo, em que ordem e com quantos
 * classificados — e quem organiza um interclasses sabe o formato que quer, não
 * a estrutura de dados dele.
 */
export type FaseDeModelo = {
    nome: string;
    formato: FormatoDeFase;
    /** Quantos avançam para a fase seguinte. A última não tem sucessora. */
    classificados?: number;
    /** Configuração inicial, por código de atributo. */
    atributos?: Record<string, string>;
};

export type ModeloDeCompeticao = {
    chave: string;
    nome: string;
    descricao: string;
    /** O que este formato exige de quem organiza, em uma linha. */
    exige: string;
    fases: FaseDeModelo[];
};

export const MODELOS: ModeloDeCompeticao[] = [
    {
        chave: "pontos-corridos",
        nome: "Pontos corridos",
        descricao:
            "Todos contra todos, tabela única. Campeão é quem soma mais pontos ao fim.",
        exige: "Pelo menos 2 equipes.",
        fases: [
            {
                nome: "Fase única",
                formato: "PONTOS_CORRIDOS",
                atributos: { idaEVolta: "false" },
            },
        ],
    },
    {
        chave: "pontos-corridos-ida-e-volta",
        nome: "Pontos corridos, turno e returno",
        descricao: "Todos contra todos duas vezes, uma em cada mando de campo.",
        exige: "Pelo menos 2 equipes, e o dobro de datas no calendário.",
        fases: [
            {
                nome: "Turno e returno",
                formato: "PONTOS_CORRIDOS",
                atributos: { idaEVolta: "true" },
            },
        ],
    },
    {
        chave: "grupos-e-mata-mata",
        nome: "Grupos e eliminatória",
        descricao:
            "Primeiro os grupos, depois os classificados se enfrentam em chave única até o título.",
        exige: "Equipes que dividam em grupos iguais — 8, 12 ou 16 funcionam bem.",
        fases: [
            {
                nome: "Fase de grupos",
                formato: "GRUPOS",
                classificados: 8,
                atributos: { numeroDeGrupos: "4", idaEVolta: "false" },
            },
            {
                nome: "Eliminatória",
                formato: "ELIMINATORIA",
                atributos: { pararEmNTimes: "1", idaEVolta: "false" },
            },
        ],
    },
    {
        chave: "grupos-semi-final",
        nome: "Grupos, semifinal e final",
        descricao:
            "Os grupos classificam quatro, que disputam semifinal e final. Formato comum em interclasses.",
        exige: "Pelo menos 8 equipes para os grupos fazerem sentido.",
        fases: [
            {
                nome: "Fase de grupos",
                formato: "GRUPOS",
                classificados: 4,
                atributos: { numeroDeGrupos: "2", idaEVolta: "false" },
            },
            {
                nome: "Semifinal e final",
                formato: "ELIMINATORIA",
                atributos: { pararEmNTimes: "1", idaEVolta: "false" },
            },
        ],
    },
    {
        chave: "mata-mata",
        nome: "Eliminatória direta",
        descricao: "Chave única do começo ao fim. Quem perde, está fora.",
        exige: "Idealmente uma potência de 2 — 8, 16, 32 equipes.",
        fases: [
            {
                nome: "Eliminatória",
                formato: "ELIMINATORIA",
                atributos: { pararEmNTimes: "1", idaEVolta: "false" },
            },
        ],
    },
    {
        chave: "classificatoria-e-final",
        nome: "Classificatória e quadrangular final",
        descricao:
            "Pontos corridos classifica quatro, que decidem entre si em outra tabela.",
        exige: "Pelo menos 6 equipes para a classificatória valer a pena.",
        fases: [
            {
                nome: "Classificatória",
                formato: "PONTOS_CORRIDOS",
                classificados: 4,
                atributos: { idaEVolta: "false" },
            },
            {
                nome: "Quadrangular final",
                formato: "PONTOS_CORRIDOS",
                atributos: { idaEVolta: "true" },
            },
        ],
    },
];
