import { z } from "zod";

export const sumulaSchema = z.object({
    id: z.number(),
    matchId: z.number(),
    arbitro: z.string(),
    golsMandante: z.number(),
    golsVisitante: z.number(),
    ocorrencias: z.array(z.string()),
    observacoesRelatadas: z.string(),
    dataFechamento: z.string().optional(),
    assinada: z.boolean(),
});

export type Sumula = z.infer<typeof sumulaSchema>;
