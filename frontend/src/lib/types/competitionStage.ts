import { z } from 'zod';


export const competitionStageNamesSchema = z.enum([
    'Pontos Corridos', 'Grupo', '16 de finais', 'Oitavas', 'Quartas', 'Semi-finais', 'Final'
]);

export type CompetitionStageNames = z.infer<typeof competitionStageNamesSchema>;

export const competitionStageSchema = z.object({
    id: z.number(),
    name: competitionStageNamesSchema,
    description: z.string(),
})

export type CompetitionStage = z.infer<typeof competitionStageSchema>;