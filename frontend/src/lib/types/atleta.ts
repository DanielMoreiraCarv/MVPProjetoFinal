import { z } from 'zod';


export const atletaSchema = z.object({
    id: z.number(),
    nome: z.string(),
    numCamisa: z.number().optional(),
    idade: z.number().optional(),
    // Precisa vir junto porque `PUT /atleta/{id}` sobrescreve todos os
    // campos: sem o CPF de volta, editar a idade apagava o CPF.
    cpf: z.string().optional(),
    pontos: z.number().optional(),
    gols: z.number().optional(),
    assistencias: z.number().optional(),
});

export type Atleta = z.infer<typeof atletaSchema>;
