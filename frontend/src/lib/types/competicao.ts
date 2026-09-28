import {z} from "zod"
import { equipeSchema } from "./equipe"


// espelha Competicao no backend
export const competicaoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string(),
    modalidade: z.string(),
    modalidadeId: z.number().optional(),
    idAdministracao: z.number().optional(),
    equipes: z.array(equipeSchema),
    isMataMata: z.boolean().optional(),
    categoria: z.string().optional(),
})

export type Competicao = z.infer<typeof competicaoSchema>
