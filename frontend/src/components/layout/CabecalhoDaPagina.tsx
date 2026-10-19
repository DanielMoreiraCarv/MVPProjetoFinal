import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Conceito, ICONES } from "@/src/lib/icones";

export type Migalha = { rotulo: string; href?: string };

/**
 * O topo de toda página: onde estou, o que é isto, e o que dá para fazer
 * aqui. Fica grudado no topo porque a ação primária some ao rolar uma lista
 * de 96 equipes, e aí ninguém a encontra.
 */
export const CabecalhoDaPagina = ({
    conceito,
    titulo,
    descricao,
    migalhas = [],
    acoes,
    className,
}: {
    conceito: Conceito;
    titulo: string;
    descricao?: string;
    migalhas?: Migalha[];
    acoes?: React.ReactNode;
    className?: string;
}) => {
    const Icone = ICONES[conceito];

    return (
        <header
            className={cn(
                "sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur print:hidden",
                className,
            )}
        >
            <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-6">
                {migalhas.length > 0 && (
                    <nav aria-label="Trilha de navegação" className="mb-2">
                        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            {migalhas.map((migalha, i) => (
                                <li key={i} className="flex items-center gap-1">
                                    {i > 0 && <ChevronRight className="size-3 opacity-60" />}
                                    {migalha.href ? (
                                        <Link
                                            href={migalha.href}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {migalha.rotulo}
                                        </Link>
                                    ) : (
                                        <span>{migalha.rotulo}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Icone className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                                {titulo}
                            </h1>
                            {descricao && (
                                <p className="truncate text-sm text-muted-foreground">
                                    {descricao}
                                </p>
                            )}
                        </div>
                    </div>
                    {acoes && <div className="flex shrink-0 items-center gap-2">{acoes}</div>}
                </div>
            </div>
        </header>
    );
};

/** O corpo da página, com a mesma largura e o mesmo respiro do cabeçalho. */
export const CorpoDaPagina = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn("mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6 print:max-w-none print:p-0", className)}>
        {children}
    </div>
);

/**
 * A trilha de toda tela dentro de uma competição: competições → administração
 * → competição → o que vier depois. Só os ancestrais — o título já diz onde
 * se está —, e escrita uma vez para nenhuma tela pular um nível.
 */
export const migalhasDaCompeticao = (
    atual: { id: number; nome: string; nomeDaAdministracao: string } | null,
    ...depois: Migalha[]
): Migalha[] => [
    { rotulo: "Competições", href: "/competicao" },
    ...(atual
        ? [
              { rotulo: atual.nomeDaAdministracao },
              { rotulo: atual.nome, href: `/competicao/${atual.id}` },
          ]
        : []),
    ...depois,
];
