import { z } from "zod";

/** O que se anota numa súmula de futebol amador. */
export const TIPOS_DE_EVENTO = [
    "GOL",
    "GOL_CONTRA",
    "CARTAO_AMARELO",
    "CARTAO_VERMELHO_INDIRETO",
    "CARTAO_VERMELHO_DIRETO",
    "FALTA_COMETIDA",
    "FALTA_SOFRIDA",
] as const;

export type TipoDeEvento = (typeof TIPOS_DE_EVENTO)[number];

export type ModoDaSumula = "SIMPLIFICADA" | "COMPLETA";

export const eventoDaSumulaSchema = z.object({
    id: z.number(),
    idAtleta: z.number(),
    nomeAtleta: z.string(),
    numCamisa: z.number().optional(),
    idEquipe: z.number(),
    tipo: z.enum(TIPOS_DE_EVENTO),
    automatico: z.boolean(),
    registradoEm: z.string(),
});

export type EventoDaSumula = z.infer<typeof eventoDaSumulaSchema>;

export const sumulaSchema = z.object({
    id: z.number(),
    idPartida: z.number(),
    arbitro: z.string(),
    placarMandante: z.number(),
    placarVisitante: z.number(),
    ocorrencias: z.array(z.string()),
    observacoes: z.string(),
    dataFechamento: z.string().optional(),
    assinada: z.boolean(),
    modo: z.enum(["SIMPLIFICADA", "COMPLETA"]),
    eventos: z.array(eventoDaSumulaSchema),
});

export type Sumula = z.infer<typeof sumulaSchema>;
