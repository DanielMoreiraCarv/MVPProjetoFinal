import { z } from "zod";
import { apiFetch } from "./client";

const modalidadeResponseSchema = z.object({
    id: z.number(),
    codigo: z.string(),
    nome: z.string(),
    jogadoresEmQuadra: z.number(),
});

export type Modalidade = z.infer<typeof modalidadeResponseSchema>;

export const listarModalidades = async (): Promise<Modalidade[]> => {
    const resposta = await apiFetch<unknown>("/modalidade");
    return z.array(modalidadeResponseSchema.passthrough()).parse(resposta).map((m) => ({
        id: m.id,
        codigo: m.codigo,
        nome: m.nome,
        jogadoresEmQuadra: m.jogadoresEmQuadra,
    }));
};
