"use client";

import { ChevronsUpDown, CornerUpLeft } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ICONES } from "@/src/lib/icones";
import { useEscopo } from "@/src/lib/escopo";

/**
 * O escopo atual, no topo do menu: competição em cima, administração em corpo
 * menor embaixo. Um clique abre a busca.
 *
 * Metade das telas só faz sentido com uma competição escolhida, e uma
 * competição mora dentro de uma administração — então o par precisa estar
 * sempre visível, não só na página que o definiu.
 */
export const SeletorDeEscopo = ({ recolhido = false }: { recolhido?: boolean }) => {
    const { atual, carregando, abrirPaleta, competicoes, ultimoId, administracaoAtual } =
        useEscopo();
    const Icone = ICONES.competicao;

    // Sem competição na rota, mas com uma última visitada: oferece a volta em
    // vez de obrigar a buscar de novo o que acabou de ser aberto.
    const ultima =
        !atual && ultimoId != null
            ? competicoes.find((competicao) => competicao.id === ultimoId)
            : undefined;

    if (recolhido) {
        return (
            <button
                type="button"
                onClick={abrirPaleta}
                title={atual ? `${atual.nome} — trocar` : "Escolher competição"}
                aria-label={atual ? `Competição ${atual.nome}. Trocar` : "Escolher competição"}
                className={cn(
                    "mx-auto flex size-10 items-center justify-center rounded-2xl border transition-colors",
                    atual
                        ? "border-transparent bg-sidebar-primary text-sidebar-primary-foreground"
                        : "border-dashed border-sidebar-border text-muted-foreground hover:text-foreground",
                )}
            >
                <Icone className="size-4" />
            </button>
        );
    }

    return (
        <div className="space-y-1.5">
        <button
            type="button"
            onClick={abrirPaleta}
            aria-label="Trocar de competição"
            className={cn(
                "flex w-full items-center gap-2.5 rounded-2xl border px-2.5 py-2 text-left transition-colors",
                atual
                    ? "border-sidebar-border bg-sidebar-accent/60 hover:bg-sidebar-accent"
                    : "border-dashed border-sidebar-border hover:bg-sidebar-accent/40",
            )}
        >
            <span
                className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    atual
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "bg-muted text-muted-foreground",
                )}
            >
                <Icone className="size-4" />
            </span>

            <span className="min-w-0 flex-1">
                {carregando && !atual ? (
                    <span className="block space-y-1.5 py-0.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-2.5 w-20" />
                    </span>
                ) : atual ? (
                    <>
                        <span className="block truncate text-sm font-medium">{atual.nome}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {atual.nomeDaAdministracao}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="block text-sm font-medium">Escolher competição</span>
                        {/* Sem competição, o subtítulo mostra a administração em
                            foco: é ela que decide o que a página de competições
                            lista. */}
                        <span className="block truncate text-xs text-muted-foreground">
                            {administracaoAtual?.nome ?? "Buscar pelo nome · ⌘K"}
                        </span>
                    </>
                )}
            </span>

            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>

        {ultima && (
            <Link
                href={`/competicao/${ultima.id}`}
                className="flex items-center gap-1.5 truncate px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
                <CornerUpLeft className="size-3 shrink-0" />
                <span className="truncate">Voltar para {ultima.nome}</span>
            </Link>
        )}
        </div>
    );
};
