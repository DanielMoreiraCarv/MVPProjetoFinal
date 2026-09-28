"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Building2, CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ICONES } from "@/src/lib/icones";
import {
    CompeticaoComAdministracao,
    normalizar,
    useEscopo,
} from "@/src/lib/escopo";

const LIMITE = 40;

/**
 * Busca por nome da competição, com a administração em subtítulo de cada
 * resultado. É o caminho rápido de troca de escopo: quem sabe o nome não
 * precisa passar pela página da administração para chegar na competição.
 *
 * Abre por ⌘K ou clicando no escopo, no topo do menu.
 */
export const PaletaDeCompeticoes = () => {
    const { competicoes, carregando, paletaAberta, fecharPaleta, atual } = useEscopo();
    const [busca, setBusca] = useState("");
    const [destacado, setDestacado] = useState(0);
    const router = useRouter();
    const listaRef = useRef<HTMLUListElement>(null);

    const resultados = useMemo(() => {
        const termo = normalizar(busca);
        const casa = (competicao: CompeticaoComAdministracao) =>
            !termo ||
            normalizar(competicao.nome).includes(termo) ||
            normalizar(competicao.nomeDaAdministracao).includes(termo);
        return competicoes.filter(casa).slice(0, LIMITE);
    }, [competicoes, busca]);

    // Uma busca nova recomeça do primeiro resultado: manter o índice antigo
    // faz o Enter abrir uma competição que não é a que está em destaque.
    useEffect(() => setDestacado(0), [busca]);

    useEffect(() => {
        if (!paletaAberta) setBusca("");
    }, [paletaAberta]);

    useEffect(() => {
        listaRef.current
            ?.querySelector(`[data-indice="${destacado}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [destacado]);

    const escolher = (competicao: CompeticaoComAdministracao) => {
        fecharPaleta();
        router.push(`/competicao/${competicao.id}`);
    };

    const aoTeclar = (evento: React.KeyboardEvent) => {
        if (evento.key === "ArrowDown") {
            evento.preventDefault();
            setDestacado((i) => (resultados.length ? (i + 1) % resultados.length : 0));
        } else if (evento.key === "ArrowUp") {
            evento.preventDefault();
            setDestacado((i) =>
                resultados.length ? (i - 1 + resultados.length) % resultados.length : 0,
            );
        } else if (evento.key === "Enter") {
            evento.preventDefault();
            const escolhida = resultados[destacado];
            if (escolhida) escolher(escolhida);
        }
    };

    const IconeCompeticao = ICONES.competicao;

    return (
        <Dialog.Root
            open={paletaAberta}
            onOpenChange={(aberta) => (aberta ? undefined : fecharPaleta())}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
                <Dialog.Popup className="fixed top-[12vh] left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-hidden rounded-4xl border border-border bg-popover text-popover-foreground shadow-2xl outline-none sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                    <Dialog.Title className="sr-only">Trocar de competição</Dialog.Title>

                    <div className="flex items-center gap-3 border-b border-border px-4">
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <input
                            autoFocus
                            value={busca}
                            onChange={(evento) => setBusca(evento.target.value)}
                            onKeyDown={aoTeclar}
                            placeholder="Buscar competição pelo nome…"
                            aria-label="Buscar competição"
                            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
                            esc
                        </kbd>
                    </div>

                    <ul ref={listaRef} className="max-h-[50vh] overflow-y-auto p-2">
                        {carregando &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <li key={i} className="flex items-center gap-3 px-2 py-2">
                                    <Skeleton className="size-9 rounded-xl" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3.5 w-1/2" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                </li>
                            ))}

                        {!carregando && resultados.length === 0 && (
                            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                                Nenhuma competição com esse nome.
                            </li>
                        )}

                        {!carregando &&
                            resultados.map((competicao, indice) => (
                                <li key={competicao.id}>
                                    <button
                                        type="button"
                                        data-indice={indice}
                                        onMouseMove={() => setDestacado(indice)}
                                        onClick={() => escolher(competicao)}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors",
                                            indice === destacado && "bg-accent text-accent-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                                                competicao.id === atual?.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground",
                                            )}
                                        >
                                            <IconeCompeticao className="size-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">
                                                {competicao.nome}
                                            </span>
                                            {/* A administração em letra menor: é o que
                                                desempata duas competições de nome
                                                parecido em ligas diferentes. */}
                                            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                                <Building2 className="size-3 shrink-0" />
                                                {competicao.nomeDaAdministracao}
                                            </span>
                                        </span>
                                        {indice === destacado && (
                                            <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />
                                        )}
                                    </button>
                                </li>
                            ))}
                    </ul>

                    <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                        <span>↑ ↓ para navegar · ↵ para abrir</span>
                        {/* O caminho longo continua existindo: quem não sabe o
                            nome vai pela administração e desce até a competição. */}
                        <button
                            type="button"
                            onClick={() => {
                                fecharPaleta();
                                router.push("/administracao");
                            }}
                            className="hover:text-foreground transition-colors"
                        >
                            Escolher por administração
                        </button>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
