import { z } from 'zod';

// O catálogo de modalidades vive no servidor e tem seis entradas, então o nome
// deixa de ser um enum fechado aqui.
export type SportName = string;

export const sportSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
});

export type Sport = z.infer<typeof sportSchema>;
