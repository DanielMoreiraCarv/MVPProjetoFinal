import { cn } from "@/lib/utils";

const TABELA = [
    { equipe: "Panteras Negras", pontos: 9, saldo: "+6" },
    { equipe: "Leões do Norte", pontos: 6, saldo: "+2" },
    { equipe: "Trovões Azuis", pontos: 3, saldo: "-1" },
    { equipe: "Tubarões Furiosos", pontos: 0, saldo: "-7" },
];

const LANCES = [
    { hora: "15:42", sigla: "G", cor: "bg-primary text-primary-foreground", texto: "Gol — Rafael · nº 9" },
    { hora: "15:31", sigla: "CA", cor: "bg-warning text-warning-foreground", texto: "Cartão amarelo — Davi · nº 4" },
    { hora: "15:18", sigla: "G", cor: "bg-primary text-primary-foreground", texto: "Gol — Bruno · nº 11" },
];

/**
 * Um retrato da tela, desenhado com os mesmos tokens do app em vez de uma
 * captura: acompanha o tema escuro e não envelhece quando a tela mudar de
 * cor. É decorativo — quem usa leitor de tela lê os recursos logo abaixo.
 */
export const PreviaDoProduto = ({ className }: { className?: string }) => (
    <div
        aria-hidden
        className={cn(
            "overflow-hidden rounded-3xl border border-border bg-card shadow-sm",
            className,
        )}
    >
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="ml-3 truncate rounded-full bg-muted px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
                meutorneio.app/acompanhar/1/partida/12
            </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-5 sm:p-5">
            <div className="space-y-3 sm:col-span-3">
                <div className="space-y-3 rounded-2xl border border-destructive/30 px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                        <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                        Ao vivo
                    </span>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <p className="text-right text-xs font-semibold sm:text-sm">Panteras Negras</p>
                        <p className="numero-tabular font-mono text-3xl font-bold tracking-tight">
                            2<span className="px-1.5 text-muted-foreground">×</span>1
                        </p>
                        <p className="text-xs font-semibold sm:text-sm">Trovões Azuis</p>
                    </div>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                    {LANCES.map((lance) => (
                        <li key={lance.hora} className="flex items-center gap-2.5 px-3 py-2">
                            <span className="numero-tabular font-mono text-[11px] text-muted-foreground">
                                {lance.hora}
                            </span>
                            <span
                                className={cn(
                                    "inline-flex h-5 min-w-7 items-center justify-center rounded-md px-1 font-mono text-[10px] font-semibold",
                                    lance.cor,
                                )}
                            >
                                {lance.sigla}
                            </span>
                            <span className="truncate text-xs">{lance.texto}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border sm:col-span-2">
                <p className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Grupo A
                </p>
                <table className="w-full table-fixed text-xs">
                    <tbody>
                        {TABELA.map((linha, i) => (
                            <tr key={linha.equipe} className={cn(i % 2 !== 0 && "bg-muted/40")}>
                                <td className="numero-tabular w-7 py-1.5 pl-3 font-mono text-muted-foreground">
                                    {i + 1}
                                </td>
                                <td className="max-w-0 truncate py-1.5">{linha.equipe}</td>
                                <td className="numero-tabular w-7 py-1.5 text-center font-mono font-semibold text-primary">
                                    {linha.pontos}
                                </td>
                                <td className="numero-tabular w-10 py-1.5 pr-3 text-right font-mono text-muted-foreground">
                                    {linha.saldo}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
