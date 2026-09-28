import { z } from "zod";

import { apiFetch } from "./client";

/**
 * `federacao` é o **nome** da federação, e não um id: a entidade guarda a
 * coluna como texto solto, sem chave estrangeira para a tabela `federacao`.
 *
 * Por isso a tela oferece a lista cadastrada em vez de campo livre — texto
 * livre viraria "CBF", "C.B.F." e "cbf" como três federações na listagem.
 * Transformar a coluna em chave estrangeira é mudança de modelo e está
 * registrada como evolução.
 */
const arbitroResponseSchema = z.object({
    id: z.number(),
    nome: z.string().nullable(),
    federacao: z.string().nullable(),
    categoria: z.string().nullable(),
    partidasApitadas: z.number().nullable(),
});

type ArbitroResponse = z.infer<typeof arbitroResponseSchema>;

export type Arbitro = {
    id: number;
    nome: string;
    /** O nome da federação; ausente quando o árbitro não tem nenhuma. */
    federacao?: string;
    categoria?: string;
    partidasApitadas: number;
};

const paraArbitro = (resposta: ArbitroResponse): Arbitro => ({
    id: resposta.id,
    nome: resposta.nome ?? "",
    federacao: resposta.federacao?.trim() ? resposta.federacao : undefined,
    categoria: resposta.categoria?.trim() ? resposta.categoria : undefined,
    partidasApitadas: resposta.partidasApitadas ?? 0,
});

export type EntradaDeArbitro = {
    nome: string;
    /** O nome da federação. Vazio quando o árbitro não é de nenhuma. */
    federacao?: string;
    categoria?: string;
};

export const listarArbitros = async (): Promise<Arbitro[]> =>
    z
        .array(arbitroResponseSchema)
        .parse((await apiFetch<unknown>("/arbitro")) ?? [])
        .map(paraArbitro);

export const buscarArbitro = async (id: number): Promise<Arbitro> =>
    paraArbitro(arbitroResponseSchema.parse(await apiFetch<unknown>(`/arbitro/${id}`)));

export const criarArbitro = async (entrada: EntradaDeArbitro): Promise<Arbitro> =>
    paraArbitro(
        arbitroResponseSchema.parse(
            await apiFetch<unknown>("/arbitro", {
                method: "POST",
                body: JSON.stringify(entrada),
            }),
        ),
    );

/** Campo ausente é campo que não muda. */
export const atualizarArbitro = async (
    id: number,
    entrada: EntradaDeArbitro,
): Promise<Arbitro> =>
    paraArbitro(
        arbitroResponseSchema.parse(
            await apiFetch<unknown>(`/arbitro/${id}`, {
                method: "PUT",
                body: JSON.stringify({ id, ...entrada }),
            }),
        ),
    );

/** Recusado com `CONFLITO` quando o árbitro está escalado em alguma partida. */
export const removerArbitro = async (id: number): Promise<void> => {
    await apiFetch<void>(`/arbitro/${id}`, { method: "DELETE" });
};
