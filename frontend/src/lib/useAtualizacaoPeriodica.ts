"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const INTERVALO_DO_AO_VIVO_MS = 30_000;

/**
 * Busca de novo a cada intervalo enquanto a aba está à vista. Aba escondida
 * não pergunta nada ao servidor; ao voltar, atualiza na hora se o dado já
 * passou do prazo — é o caso de quem guardou o celular no bolso no intervalo.
 *
 * Falha numa atualização não derruba a tela: o último dado bom fica, e o
 * indicador avisa que a conexão caiu até a próxima tentativa dar certo.
 */
export const useAtualizacaoPeriodica = (
    atualizar: () => Promise<unknown>,
    { ativa = true, intervalo = INTERVALO_DO_AO_VIVO_MS } = {},
) => {
    const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
    const [atualizando, setAtualizando] = useState(false);
    const [falhou, setFalhou] = useState(false);
    const emAndamento = useRef(false);
    const ultimaVez = useRef(0);
    const atualizarAtual = useRef(atualizar);

    useEffect(() => {
        atualizarAtual.current = atualizar;
    }, [atualizar]);

    const atualizarAgora = useCallback(async () => {
        if (emAndamento.current) return;
        emAndamento.current = true;
        setAtualizando(true);
        try {
            await atualizarAtual.current();
            setFalhou(false);
            ultimaVez.current = Date.now();
            setAtualizadoEm(new Date(ultimaVez.current));
        } catch {
            setFalhou(true);
        } finally {
            emAndamento.current = false;
            setAtualizando(false);
        }
    }, []);

    /** Quem carregou por conta própria avisa, para o relógio contar dali. */
    const marcarComoAtualizado = useCallback(() => {
        ultimaVez.current = Date.now();
        setAtualizadoEm(new Date(ultimaVez.current));
        setFalhou(false);
    }, []);

    useEffect(() => {
        if (!ativa) return;

        const id = window.setInterval(() => {
            if (!document.hidden) void atualizarAgora();
        }, intervalo);

        const aoMudarVisibilidade = () => {
            if (!document.hidden && Date.now() - ultimaVez.current >= intervalo) {
                void atualizarAgora();
            }
        };
        document.addEventListener("visibilitychange", aoMudarVisibilidade);

        return () => {
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", aoMudarVisibilidade);
        };
    }, [ativa, intervalo, atualizarAgora]);

    return { atualizadoEm, atualizando, falhou, atualizarAgora, marcarComoAtualizado };
};
