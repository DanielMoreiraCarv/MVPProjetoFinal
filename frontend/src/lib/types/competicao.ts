import {z} from "zod"
import { equipeSchema } from "./equipe"


// espelha Competicao no backend
export const estadoDaCompeticaoSchema = z.enum([
    "RASCUNHO",
    "EM_ANDAMENTO",
    "ENCERRADA",
    "CANCELADA",
]);

export type EstadoDaCompeticao = z.infer<typeof estadoDaCompeticaoSchema>;

/** O rótulo de tela de cada estado, num lugar só. */
export const ROTULO_DO_ESTADO: Record<EstadoDaCompeticao, string> = {
    RASCUNHO: "Rascunho",
    EM_ANDAMENTO: "Em andamento",
    ENCERRADA: "Encerrada",
    CANCELADA: "Cancelada",
};

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
    estado: estadoDaCompeticaoSchema.optional(),
    publica: z.boolean().optional(),
})

export type Competicao = z.infer<typeof competicaoSchema>
