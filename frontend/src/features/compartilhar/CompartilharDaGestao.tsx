"use client";

import { CompartilharDialog } from "@/src/features/compartilhar/CompartilharDialog";
import { mudarVisibilidadeDaCompeticao } from "@/src/lib/api/competicoes";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";

/**
 * O compartilhar das telas de gestão: lê a competição do escopo e, ao abrir
 * ou fechar ao público, recarrega o escopo para todas as telas verem o mesmo.
 */
export const CompartilharDaGestao = ({
    partida,
    gatilho,
}: {
    partida?: { id: number; rotulo: string };
    gatilho?: React.ReactElement;
}) => {
    const { atual, recarregar } = useEscopo();
    const avisos = useAvisos();

    if (!atual) return null;

    const mudarVisibilidade = async (publica: boolean) => {
        try {
            await mudarVisibilidadeDaCompeticao(atual.id, publica);
            recarregar();
            avisos.sucesso(
                publica ? "Competição aberta ao público." : "Competição privada de novo.",
                publica ? "O link já funciona para quem receber." : "Os links compartilhados param de mostrar a competição.",
            );
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    return (
        <CompartilharDialog
            competicao={atual}
            partida={partida}
            aoMudarVisibilidade={mudarVisibilidade}
            gatilho={gatilho}
        />
    );
};
