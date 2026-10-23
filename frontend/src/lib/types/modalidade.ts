import { z } from 'zod';

// O catálogo de modalidades vive no servidor e tem seis entradas, então o nome
// deixa de ser um enum fechado aqui.
export type NomeModalidade = string;

export const modalidadeSchema = z.object({
    id: z.number(),
    nome: z.string(),
    atletasEmQuadra: z.number().optional(),
});

export type Modalidade = z.infer<typeof modalidadeSchema>;
