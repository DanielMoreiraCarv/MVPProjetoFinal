import { z } from 'zod';


export const playerSchema = z.object({
    id: z.string(),
    name: z.string(),
    number: z.number().optional(),
    age: z.number().optional(),
    suspended: z.boolean(),
});

export type Player = z.infer<typeof playerSchema>;
