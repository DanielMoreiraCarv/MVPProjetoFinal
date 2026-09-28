import { z } from "zod";


export const faseNomeSchema = z.enum([
    'Pontos Corridos', 'Grupo', '16 de finais', 'Oitavas', 'Quartas', 'Semi-finais', 'Final'
]);

export type FaseNome = z.infer<typeof faseNomeSchema>;

export const partidaSchema = z.object({
    id: z.number(),
    equipeMandante: z.string(),
    placarMandante: z.number().optional(),
    equipeVisitante: z.string(),
    placarVisitante: z.number().optional(),
    vencedor: z.string().optional(),
    nomeCompeticao: z.string(),
    idCompeticao: z.number(),
    realizada: z.boolean(),
    fase: z.string().optional(),
    arbitro: z.string().optional(),
});

export type Partida = z.infer<typeof partidaSchema>;
