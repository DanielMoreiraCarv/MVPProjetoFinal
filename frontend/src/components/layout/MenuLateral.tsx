"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlternarTema } from "@/src/components/AlternarTema";
import { Monograma } from "@/src/components/Monograma";
import { ICONES } from "@/src/lib/icones";
import { useEscopo } from "@/src/lib/escopo";
import { SeletorDeEscopo } from "@/src/components/layout/SeletorDeEscopo";
import {
    ItemDeMenu,
    SECOES_GLOBAIS,
    SecaoDeMenu,
    itemAtivo,
    secoesDaCompeticao,
} from "@/src/components/layout/navegacao";

const Item = ({
    item,
    recolhido,
    aoNavegar,
}: {
    item: ItemDeMenu;
    recolhido: boolean;
    aoNavegar?: () => void;
}) => {
    const caminho = usePathname() ?? "/";
    const ativo = itemAtivo(item, caminho);
    const Icone = ICONES[item.conceito];

    return (
        <Link
            href={item.href}
            onClick={aoNavegar}
            aria-current={ativo ? "page" : undefined}
            title={recolhido ? item.rotulo : undefined}
            className={cn(
                "group flex items-center gap-3 rounded-2xl px-2 py-2 text-sm transition-colors",
                recolhido && "justify-center px-0",
                ativo
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
        >
            {/* O quadrado arredondado atrás do ícone é o que dá a mesma
                âncora visual a todos os itens, cheios ou vazios. */}
            <span
                className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                    ativo
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "bg-muted/60 text-muted-foreground group-hover:text-sidebar-accent-foreground",
                )}
            >
                <Icone className="size-4" />
            </span>
            {!recolhido && <span className="truncate">{item.rotulo}</span>}
        </Link>
    );
};

const Secao = ({
    secao,
    recolhido,
    aoNavegar,
}: {
    secao: SecaoDeMenu;
    recolhido: boolean;
    aoNavegar?: () => void;
}) => (
    <div className="space-y-1">
        {secao.titulo && !recolhido && (
            <p className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {secao.titulo}
            </p>
        )}
        {secao.titulo && recolhido && <div className="mx-2 my-3 border-t border-sidebar-border" />}
        {secao.itens.map((item) => (
            <Item key={item.href} item={item} recolhido={recolhido} aoNavegar={aoNavegar} />
        ))}
    </div>
);

export const ConteudoDoMenu = ({
    recolhido = false,
    aoNavegar,
    aoRecolher,
}: {
    recolhido?: boolean;
    aoNavegar?: () => void;
    aoRecolher?: () => void;
}) => {
    const { atual } = useEscopo();
    // A seção da competição só existe com competição escolhida: metade destas
    // telas não tem o que mostrar sem escopo.
    const secoesDoEscopo: SecaoDeMenu[] = atual ? secoesDaCompeticao(atual.id) : [];

    return (
    <div className="flex h-full flex-col gap-1 bg-sidebar text-sidebar-foreground">
        <div
            className={cn(
                "flex items-center gap-2 px-3 py-4",
                recolhido && "justify-center px-0",
            )}
        >
            <Link
                href="/"
                onClick={aoNavegar}
                className="flex items-center gap-2 font-semibold tracking-tight"
            >
                <Monograma nome="Meu Torneio" destacado className="size-8" />
                {!recolhido && <span className="text-sm">Meu Torneio</span>}
            </Link>
        </div>

        <div className={cn("px-3 pb-2", recolhido && "px-2")}>
            <SeletorDeEscopo recolhido={recolhido} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
            {[...SECOES_GLOBAIS, ...secoesDoEscopo].map((secao, i) => (
                <Secao
                    key={secao.titulo ?? i}
                    secao={secao}
                    recolhido={recolhido}
                    aoNavegar={aoNavegar}
                />
            ))}
        </nav>

        <div
            className={cn(
                "flex items-center gap-2 border-t border-sidebar-border px-3 py-3",
                recolhido && "flex-col px-1",
            )}
        >
            <AlternarTema compacto={recolhido} />
            {aoRecolher && (
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={aoRecolher}
                    aria-label={recolhido ? "Expandir o menu" : "Recolher o menu"}
                    title={recolhido ? "Expandir o menu" : "Recolher o menu"}
                    className={cn(!recolhido && "ml-auto")}
                >
                    {recolhido ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
            )}
        </div>
    </div>
    );
};
