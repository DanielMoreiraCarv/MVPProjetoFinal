import { z } from "zod";

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
});

export type Sumula = z.infer<typeof sumulaSchema>;
