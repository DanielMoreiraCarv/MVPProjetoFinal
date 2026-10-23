"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Conceito, ICONES } from "@/src/lib/icones";

/**
 * As quatro situações que toda tela que lê da API atravessa. Antes disto
 * nenhuma tela tinha nenhuma: enquanto carregava, a tela ficava em branco;
 * quando falhava, ficava em branco também.
 */

/* ---------------------------------------------------------- carregando --- */

/**
 * Esqueleto com a forma do conteúdo, não roda-gigante. O esqueleto diz o que
 * vem e não move a página quando o dado chega; o spinner não diz nada e
 * empurra tudo.
 */
export const CarregandoLista = ({ linhas = 5 }: { linhas?: number }) => (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
        <span className="sr-only">Carregando</span>
        {Array.from({ length: linhas }).map((_, i) => (
            <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
                <Skeleton className="size-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        ))}
    </div>
);

export const CarregandoCartoes = ({ cartoes = 6 }: { cartoes?: number }) => (
    <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-live="polite"
    >
        <span className="sr-only">Carregando</span>
        {Array.from({ length: cartoes }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-border bg-card p-4">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        ))}
    </div>
);

export const CarregandoTabela = ({
    linhas = 8,
    colunas = 5,
}: {
    linhas?: number;
    colunas?: number;
}) => (
    <div className="overflow-hidden rounded-2xl border border-border" aria-busy="true">
        <span className="sr-only">Carregando</span>
        <div className="flex gap-4 border-b border-border bg-muted/40 px-4 py-3">
            {Array.from({ length: colunas }).map((_, i) => (
                <Skeleton key={i} className={cn("h-3", i === 0 ? "flex-1" : "w-10")} />
            ))}
        </div>
        {Array.from({ length: linhas }).map((_, l) => (
            <div key={l} className="flex gap-4 border-b border-border px-4 py-3 last:border-0">
                {Array.from({ length: colunas }).map((_, c) => (
                    <Skeleton key={c} className={cn("h-3.5", c === 0 ? "flex-1" : "w-10")} />
                ))}
            </div>
        ))}
    </div>
);

/* ---------------------------------------------------------------- vazio --- */

export const Vazio = ({
    conceito,
    titulo,
    descricao,
    acao,
    className,
}: {
    conceito: Conceito;
    titulo: string;
    descricao?: string;
    acao?: React.ReactNode;
    className?: string;
}) => {
    const Icone = ICONES[conceito];

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center",
                className,
            )}
        >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Icone className="size-5" />
            </span>
            <div className="space-y-1">
                <p className="font-medium">{titulo}</p>
                {descricao && (
                    <p className="mx-auto max-w-sm text-sm text-muted-foreground">{descricao}</p>
                )}
            </div>
            {acao}
        </div>
    );
};

/* ----------------------------------------------------------------- erro --- */

/**
 * Mostra a causa que veio do servidor, não "algo deu errado": o contrato de
 * erro da API existe para a pessoa saber o que corrigir.
 */
export const Erro = ({
    causa,
    aoTentarDeNovo,
    className,
}: {
    causa: unknown;
    aoTentarDeNovo?: () => void;
    className?: string;
}) => {
    const mensagem =
        causa instanceof Error
            ? causa.message
            : typeof causa === "string"
              ? causa
              : "A requisição falhou.";

    return (
        <div
            role="alert"
            className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-6 py-10 text-center",
                className,
            )}
        >
            <p className="text-sm font-medium text-destructive">Não foi possível carregar</p>
            <p className="max-w-md text-sm text-muted-foreground">{mensagem}</p>
            {aoTentarDeNovo && (
                <Button variant="outline" size="sm" onClick={aoTentarDeNovo}>
                    <RotateCw />
                    Tentar de novo
                </Button>
            )}
        </div>
    );
};
