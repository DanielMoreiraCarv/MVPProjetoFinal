"use client";

import { AlertTriangle, Check, RotateCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CarregandoLista, Erro } from "@/src/components/estado/Estados";
import { Estrutura, buscarEstrutura } from "@/src/lib/api/competicoes";

/**
 * A situação da fase dentro da estrutura: se ela fecha — validada contra a
 * entrada que vai ter, também quando ainda depende da anterior — e se os
 * confrontos dela já existem.
 *
 * Não gera nada. Gerar fase por fase deixava nascer partidas de uma estrutura
 * que não fechava; as partidas saem todas pelo botão único da Estrutura e da
 * visão geral, e as fases seguintes quando a anterior termina.
 */
export const ConfrontosDaFase = ({
    idFase,
    idCompeticao,
    versaoDaConfiguracao = 0,
}: {
    idFase: number;
    idCompeticao: number;
    /** Muda quando a configuração é gravada: a validação precisa ser refeita. */
    versaoDaConfiguracao?: number;
}) => {
    const [estrutura, setEstrutura] = useState<Estrutura | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const conferir = useCallback(() => {
        setCarregando(true);
        setErro(null);
        buscarEstrutura(idCompeticao)
            .then(setEstrutura)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idCompeticao]);

    useEffect(conferir, [conferir, versaoDaConfiguracao]);

    if (erro) return <Erro causa={erro} aoTentarDeNovo={conferir} />;
    if (carregando || !estrutura) return <CarregandoLista linhas={2} />;

    const indice = estrutura.fases.findIndex((fase) => fase.idFase === idFase);
    const fase = estrutura.fases[indice];
    if (!fase) return null;
    const anterior = indice > 0 ? estrutura.fases[indice - 1] : undefined;

    return (
        <div className="space-y-3 rounded-3xl border border-border bg-card px-5 py-4">
            {fase.partidas > 0 ? (
                <p className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-success" />
                    <span>
                        {fase.partidas === 1 ? "1 partida gerada" : `${fase.partidas} partidas geradas`} nesta
                        fase.
                    </span>
                </p>
            ) : fase.valida ? (
                <p className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-success" />
                    <span>
                        {estrutura.partidasGeradas && anterior
                            ? `A fase fecha. Os confrontos saem quando ${anterior.nome} terminar.`
                            : "A fase fecha com a estrutura."}
                    </span>
                </p>
            ) : (
                <div className="space-y-2 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                            {fase.erros.length === 1
                                ? "Falta uma coisa para a fase fechar"
                                : `Faltam ${fase.erros.length} coisas para a fase fechar`}
                        </span>
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {fase.erros.map((motivo) => (
                            <li key={motivo}>{motivo}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {estrutura.partidasGeradas
                        ? "As fases seguintes são geradas quando a anterior termina."
                        : "As partidas de todas as fases são geradas juntas, pelo botão Gerar partidas."}
                </p>
                <span className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={conferir}>
                        <RotateCw />
                        Conferir de novo
                    </Button>
                    {!estrutura.partidasGeradas && (
                        <Button
                            size="sm"
                            nativeButton={false}
                            render={<Link href={`/competicao/${idCompeticao}/estrutura`} />}
                        >
                            Gerar partidas na Estrutura
                        </Button>
                    )}
                </span>
            </div>
        </div>
    );
};
