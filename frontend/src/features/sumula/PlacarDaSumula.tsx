"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

const Lado = ({
    equipe,
    gols,
    golsComAutor,
    editavel,
    ocupado,
    aoMudar,
    alinhamento,
}: {
    equipe: string;
    gols: number;
    golsComAutor: number;
    editavel: boolean;
    ocupado: boolean;
    aoMudar: (gols: number) => void;
    alinhamento: "inicio" | "fim";
}) => (
    <div
        className={
            alinhamento === "fim"
                ? "flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-end"
                : "flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start"
        }
    >
        <p className="max-w-full truncate text-center text-base font-semibold sm:text-lg">{equipe}</p>
        <div className="flex items-center gap-2">
            {editavel && (
                <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label={`Tirar um gol de ${equipe}`}
                    // Abaixo dos gols com autor a súmula diria que alguém
                    // marcou um gol que não entrou: tira-se o gol do atleta.
                    disabled={ocupado || gols <= golsComAutor}
                    title={
                        gols <= golsComAutor && gols > 0
                            ? "Os gols restantes têm autor: tire o gol na tabela do atleta."
                            : undefined
                    }
                    onClick={() => aoMudar(gols - 1)}
                >
                    <Minus />
                </Button>
            )}
            <span className="numero-tabular min-w-12 text-center font-mono text-5xl font-bold tracking-tight">
                {gols}
            </span>
            {editavel && (
                <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label={`Somar um gol para ${equipe}`}
                    disabled={ocupado}
                    onClick={() => aoMudar(gols + 1)}
                >
                    <Plus />
                </Button>
            )}
        </div>
    </div>
);

/**
 * O placar no topo da súmula. Nos dois modos ele aceita o número direto —
 * o gol de que ninguém sabe o autor —; na súmula completa, o gol lançado no
 * atleta já soma aqui sozinho.
 */
export const PlacarDaSumula = ({
    mandante,
    visitante,
    placarMandante,
    placarVisitante,
    golsComAutorMandante,
    golsComAutorVisitante,
    editavel,
    ocupado,
    aoMudar,
}: {
    mandante: string;
    visitante: string;
    placarMandante: number;
    placarVisitante: number;
    golsComAutorMandante: number;
    golsComAutorVisitante: number;
    editavel: boolean;
    ocupado: boolean;
    aoMudar: (mandante: number, visitante: number) => void;
}) => (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-5 py-6 sm:flex-row sm:gap-6">
        <Lado
            equipe={mandante}
            gols={placarMandante}
            golsComAutor={golsComAutorMandante}
            editavel={editavel}
            ocupado={ocupado}
            aoMudar={(gols) => aoMudar(gols, placarVisitante)}
            alinhamento="fim"
        />
        <span className="font-mono text-3xl text-muted-foreground">×</span>
        <Lado
            equipe={visitante}
            gols={placarVisitante}
            golsComAutor={golsComAutorVisitante}
            editavel={editavel}
            ocupado={ocupado}
            aoMudar={(gols) => aoMudar(placarMandante, gols)}
            alinhamento="inicio"
        />
    </div>
);
