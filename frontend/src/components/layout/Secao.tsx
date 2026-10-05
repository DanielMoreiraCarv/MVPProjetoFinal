import { cn } from "@/lib/utils";

/**
 * Um bloco de conteúdo com título em versalete e a ação à direita. Era
 * copiado em dezesseis páginas, cada cópia com uma diferença pequena — e foi
 * numa delas que faltou o `min-w-0` que fazia a página rolar de lado no
 * celular.
 */
export const Secao = ({
    titulo,
    descricao,
    acao,
    className,
    children,
}: {
    titulo: string;
    descricao?: string;
    acao?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section className={cn("min-w-0 space-y-3", className)}>
        <div className="flex min-h-9 items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-0.5 pt-2">
                <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {titulo}
                </h2>
                {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
            </div>
            {acao && <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">{acao}</div>}
        </div>
        {children}
    </section>
);
