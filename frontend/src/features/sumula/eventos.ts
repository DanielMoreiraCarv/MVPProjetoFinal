import { EventoDaSumula, TipoDeEvento } from "@/src/lib/types/sumula";

/**
 * As colunas da tabela da súmula, na ordem em que se lê a folha. O rótulo é
 * de futebol: a súmula de outra modalidade troca esta lista, não o servidor.
 */
export const COLUNAS_DA_SUMULA: { tipo: TipoDeEvento; sigla: string; nome: string }[] = [
    { tipo: "GOL", sigla: "G", nome: "Gol" },
    { tipo: "GOL_CONTRA", sigla: "GC", nome: "Gol contra" },
    { tipo: "CARTAO_AMARELO", sigla: "CA", nome: "Cartão amarelo" },
    { tipo: "CARTAO_VERMELHO_INDIRETO", sigla: "VI", nome: "Vermelho indireto (segundo amarelo)" },
    { tipo: "CARTAO_VERMELHO_DIRETO", sigla: "VD", nome: "Vermelho direto" },
    { tipo: "FALTA_COMETIDA", sigla: "FC", nome: "Falta cometida" },
    { tipo: "FALTA_SOFRIDA", sigla: "FS", nome: "Falta sofrida" },
];

/** A cor de cada acontecimento, a mesma na súmula e no acompanhamento. Falta não tem: é a mais comum e não pede destaque. */
export const COR_DO_EVENTO: Partial<Record<TipoDeEvento, string>> = {
    GOL: "bg-primary text-primary-foreground",
    GOL_CONTRA: "bg-secondary text-secondary-foreground",
    CARTAO_AMARELO: "bg-warning text-warning-foreground",
    CARTAO_VERMELHO_INDIRETO: "bg-destructive text-destructive-foreground",
    CARTAO_VERMELHO_DIRETO: "bg-destructive text-destructive-foreground",
};

export const contar = (eventos: EventoDaSumula[], idAtleta: number, tipo: TipoDeEvento) =>
    eventos.filter((evento) => evento.idAtleta === idAtleta && evento.tipo === tipo).length;

/** Corrigir tira o lançamento mais recente — e prefere o que a pessoa lançou ao que o sistema gerou. */
export const ultimoLancamento = (eventos: EventoDaSumula[], idAtleta: number, tipo: TipoDeEvento) => {
    const doAtleta = eventos.filter((e) => e.idAtleta === idAtleta && e.tipo === tipo);
    return [...doAtleta].reverse().find((e) => !e.automatico) ?? doAtleta[doAtleta.length - 1];
};

export const expulso = (eventos: EventoDaSumula[], idAtleta: number) =>
    contar(eventos, idAtleta, "CARTAO_VERMELHO_INDIRETO") + contar(eventos, idAtleta, "CARTAO_VERMELHO_DIRETO") > 0;
