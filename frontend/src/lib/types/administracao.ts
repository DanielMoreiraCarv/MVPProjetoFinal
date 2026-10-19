import { z } from "zod";
import { competicaoSchema } from "./competicao";

export const administracaoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string(),
    competicoes: z.array(competicaoSchema)
});

export type Administracao = z.infer<typeof administracaoSchema>;
