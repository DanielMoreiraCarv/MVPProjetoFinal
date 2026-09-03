import { z } from 'zod';


export const sportNameSchema = z.enum(['Futebol', 'Basquete', 'Vôlei'])

export type SportName = z.infer<typeof sportNameSchema>;

export const sportSchema = z.object({
    id: z.number(),
    name: sportNameSchema,
    description: z.string(),
});

export type Sport = z.infer<typeof sportSchema>;
