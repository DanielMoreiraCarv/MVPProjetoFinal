"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { COLUNAS_DA_SUMULA, contar, expulso } from "@/src/features/sumula/eventos";
import { Atleta } from "@/src/lib/types/atleta";
import { EventoDaSumula, TipoDeEvento } from "@/src/lib/types/sumula";

const COR_DA_COLUNA: Partial<Record<TipoDeEvento, string>> = {
    GOL: "bg-primary text-primary-foreground",
    GOL_CONTRA: "bg-secondary text-secondary-foreground",
    CARTAO_AMARELO: "bg-warning text-warning-foreground",
    CARTAO_VERMELHO_INDIRETO: "bg-destructive text-destructive-foreground",
    CARTAO_VERMELHO_DIRETO: "bg-destructive text-destructive-foreground",
};

/**
 * O elenco de uma equipe com uma coluna por acontecimento. Cada célula é um
 * botão: um toque lança, e no modo de correção o toque tira o último — é o
 * que mantém o registro em poucos toques à beira do campo (RNF01).
 */
export const TabelaDoElenco = ({
    equipe,
    atletas,
    eventos,
    corrigindo,
    editavel,
    pendente,
    aoTocar,
}: {
    equipe: string;
    atletas: Atleta[];
    eventos: EventoDaSumula[];
    corrigindo: boolean;
    editavel: boolean;
    /** A célula que está indo ao servidor, para não aceitar toque duplo. */
    pendente: string | null;
    aoTocar: (atleta: Atleta, tipo: TipoDeEvento) => void;
}) => {
    const emOrdem = [...atletas].sort((a, b) => (a.numCamisa ?? 999) - (b.numCamisa ?? 999));

    return (
        <TooltipProvider>
        <section className="min-w-0 space-y-2">
            <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {equipe}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-xs sm:text-sm">
                    <thead>
                        <tr className="border-b border-border text-xs text-muted-foreground">
                            <th className="w-10 py-2.5 pl-3 text-left font-medium sm:w-12 sm:pl-5">Nº</th>
                            <th className="py-2.5 text-left font-medium">Atleta</th>
                            {COLUNAS_DA_SUMULA.map((coluna) => (
                                <th
                                    key={coluna.tipo}
                                    className="w-7 px-0 py-2.5 text-center font-medium last:pr-3 sm:w-9 sm:px-0.5 sm:last:pr-4"
                                >
                                    {/* O title nativo demora e alguns navegadores nem
                                        mostram; a dica aparece na hora, e também no
                                        foco do teclado. */}
                                    <Tooltip>
                                        <TooltipTrigger
                                            render={<abbr tabIndex={0} />}
                                            aria-label={coluna.nome}
                                            className="cursor-help rounded-md px-1 no-underline decoration-dotted underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                                        >
                                            {coluna.sigla}
                                        </TooltipTrigger>
                                        <TooltipContent>{coluna.nome}</TooltipContent>
                                    </Tooltip>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {emOrdem.length === 0 && (
                            <tr>
                                <td colSpan={2 + COLUNAS_DA_SUMULA.length} className="px-5 py-6 text-center text-muted-foreground">
                                    Elenco vazio. Cadastre os atletas na página da equipe.
                                </td>
                            </tr>
                        )}
                        {emOrdem.map((atleta) => {
                            const fora = expulso(eventos, atleta.id);
                            return (
                                <tr
                                    key={atleta.id}
                                    className={cn(
                                        "border-b border-border last:border-0",
                                        fora && "bg-destructive/10",
                                    )}
                                >
                                    <td className="numero-tabular py-1 pl-3 font-mono text-xs text-muted-foreground sm:pl-5 sm:text-sm">
                                        {atleta.numCamisa ?? "—"}
                                    </td>
                                    <td className="max-w-0 py-1 pr-1">
                                        <span className="block truncate" title={atleta.nome}>
                                            {atleta.nome}
                                        </span>
                                    </td>
                                    {COLUNAS_DA_SUMULA.map((coluna) => {
                                        const quantos = contar(eventos, atleta.id, coluna.tipo);
                                        const chave = `${atleta.id}-${coluna.tipo}`;
                                        const inerte =
                                            !editavel || pendente === chave || (corrigindo && quantos === 0);
                                        return (
                                            <td key={coluna.tipo} className="px-0 py-1 text-center last:pr-3 sm:px-0.5 sm:last:pr-4">
                                                <button
                                                    type="button"
                                                    disabled={inerte}
                                                    onClick={() => aoTocar(atleta, coluna.tipo)}
                                                    aria-label={`${corrigindo ? "Tirar" : "Lançar"} ${coluna.nome.toLowerCase()} de ${atleta.nome}`}
                                                    title={`${coluna.nome} — ${atleta.nome}`}
                                                    className={cn(
                                                        "numero-tabular inline-flex size-7 items-center justify-center rounded-lg font-mono text-xs transition-colors sm:size-8 sm:rounded-xl sm:text-sm",
                                                        quantos > 0
                                                            ? (COR_DA_COLUNA[coluna.tipo] ?? "bg-muted text-foreground")
                                                            : "text-muted-foreground/40",
                                                        editavel && !inerte && (corrigindo ? "hover:ring-2 hover:ring-destructive/50" : "hover:bg-accent hover:text-accent-foreground"),
                                                        pendente === chave && "animate-pulse",
                                                        !editavel && "cursor-default",
                                                    )}
                                                >
                                                    {quantos > 0 ? quantos : "·"}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
        </TooltipProvider>
    );
};
