import { z } from 'zod';


export const faseNomeSchema = z.enum([
    'Pontos Corridos', 'Grupo', '16 de finais', 'Oitavas', 'Quartas', 'Semi-finais', 'Final'
]);

export type FaseNome = z.infer<typeof faseNomeSchema>;

export const faseSchema = z.object({
    id: z.number(),
    nome: faseNomeSchema,
    descricao: z.string(),
})

export type Fase = z.infer<typeof faseSchema>;
