import { z } from "zod";
import { apiFetch } from "./client";

/**
 * Catálogo fixo: a API só expõe leitura (`GET /modalidade` e
 * `GET /modalidade/{id}`). As modalidades entram no boot da aplicação, não
 * por tela.
 *
 * O campo é `atletasEmQuadra` — o schema pedia `jogadoresEmQuadra`, que a
 * resposta nunca trouxe, e o `parse` derrubava a lista inteira antes de
 * qualquer tela ver o catálogo. "Jogador" também não é palavra do glossário.
 */
const modalidadeResponseSchema = z.object({
    id: z.number(),
    codigo: z.string(),
    nome: z.string(),
    atletasEmQuadra: z.number(),
    ativo: z.boolean().nullable().optional(),
});

export type Modalidade = {
    id: number;
    codigo: string;
    nome: string;
    atletasEmQuadra: number;
    ativo: boolean;
};

const paraModalidade = (
    resposta: z.infer<typeof modalidadeResponseSchema>,
): Modalidade => ({
    id: resposta.id,
    codigo: resposta.codigo,
    nome: resposta.nome,
    atletasEmQuadra: resposta.atletasEmQuadra,
    ativo: resposta.ativo ?? true,
});

export const listarModalidades = async (): Promise<Modalidade[]> =>
    z
        .array(modalidadeResponseSchema.passthrough())
        .parse((await apiFetch<unknown>("/modalidade")) ?? [])
        .map(paraModalidade);

export const buscarModalidade = async (id: number): Promise<Modalidade> =>
    paraModalidade(
        modalidadeResponseSchema
            .passthrough()
            .parse(await apiFetch<unknown>(`/modalidade/${id}`)),
    );
