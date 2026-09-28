import { z } from "zod";
import { atletaSchema } from "./atleta";
import { modalidadeSchema } from "./modalidade";


export const equipeSchema = z.object({
    id: z.number(),
    nome: z.string(),
    atletas: z.array(atletaSchema),
    modalidade: modalidadeSchema
});

export type Equipe = z.infer<typeof equipeSchema>;
