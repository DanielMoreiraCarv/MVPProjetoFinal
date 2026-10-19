"use client";

import { Share2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlternarTema } from "@/src/components/AlternarTema";
import { Monograma } from "@/src/components/Monograma";
import { CompartilharDialog } from "@/src/features/compartilhar/CompartilharDialog";
import { Competicao, ROTULO_DO_ESTADO } from "@/src/lib/types/competicao";
import { enderecoPublicoDaCompeticao } from "@/src/lib/visao-publica";

/** A marca do app, que leva à apresentação. A mesma na entrada e no acompanhamento. */
export const MarcaDoApp = () => (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <Monograma nome="Meu Torneio" destacado className="size-8" />
        <span className="text-sm">Meu Torneio</span>
    </Link>
);

const Aba = ({ href, ativa, children }: { href: string; ativa: boolean; children: React.ReactNode }) => (
    <Link
        href={href}
        aria-current={ativa ? "page" : undefined}
        className={cn(
            "-mb-px border-b-2 px-1 pb-2.5 text-sm transition-colors",
            ativa
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
        )}
    >
        {children}
    </Link>
);

/**
 * A moldura do acompanhamento: sem menu lateral e sem nada de edição. Quem
 * chega por link de partida vê, no topo, a competição a que ela pertence e
 * as abas para navegar pelo resto.
 */
export const CascaPublica = ({
    competicao,
    children,
}: {
    competicao?: Competicao;
    children: React.ReactNode;
}) => {
    const caminho = usePathname() ?? "";
    const raiz = competicao ? enderecoPublicoDaCompeticao(competicao.id) : "";
    const naPartida = caminho.startsWith(`${raiz}/partida`);

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur print:hidden">
                <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3 sm:px-6">
                    <MarcaDoApp />
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                        Acompanhamento ao vivo
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                        <AlternarTema compacto />
                        <Button
                            variant="ghost"
                            size="sm"
                            nativeButton={false}
                            render={<Link href="/entrar" />}
                        >
                            Sou da organização
                        </Button>
                    </div>
                </div>

                {competicao && (
                    <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
                        <div className="flex flex-wrap items-center gap-3 pt-2 pb-3">
                            <Monograma nome={competicao.nome} className="size-10 rounded-2xl" />
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                                    {competicao.nome}
                                </h1>
                                <p className="truncate text-sm text-muted-foreground">
                                    {[competicao.modalidade, competicao.categoria]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {competicao.estado && competicao.estado !== "EM_ANDAMENTO" && (
                                    <Badge variant="secondary">{ROTULO_DO_ESTADO[competicao.estado]}</Badge>
                                )}
                                {/* Na partida, o compartilhar fica no placar e já
                                    oferece a competição inteira como opção. */}
                                {!naPartida && (
                                    <CompartilharDialog
                                        competicao={competicao}
                                        gatilho={
                                            <Button variant="outline" size="sm" aria-label="Compartilhar">
                                                <Share2 />
                                                <span className="hidden sm:inline">Compartilhar</span>
                                            </Button>
                                        }
                                    />
                                )}
                            </div>
                        </div>
                        <nav aria-label="Seções da competição" className="flex gap-5">
                            <Aba href={raiz} ativa={!naPartida}>
                                Visão geral
                            </Aba>
                            <Aba href={`${raiz}/partida`} ativa={naPartida}>
                                Partidas
                            </Aba>
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex min-w-0 flex-1 flex-col">{children}</main>

            <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground print:hidden">
                Somente leitura · os dados atualizam sozinhos durante os jogos
            </footer>
        </div>
    );
};
