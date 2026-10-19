"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHAVE_DO_TEMA, Tema } from "@/src/lib/tema";

const OPCOES: { valor: Tema; rotulo: string; Icone: typeof Sun }[] = [
    { valor: "claro", rotulo: "Tema claro", Icone: Sun },
    { valor: "escuro", rotulo: "Tema escuro", Icone: Moon },
    { valor: "sistema", rotulo: "Seguir o sistema", Icone: Monitor },
];

const aplicar = (tema: Tema) => {
    const escuro =
        tema === "escuro" ||
        (tema === "sistema" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", escuro);
};

export const AlternarTema = ({
    className,
    compacto = false,
}: {
    className?: string;
    /** No menu recolhido não cabem três botões: um só, que alterna em ciclo. */
    compacto?: boolean;
}) => {
    // Começa em "sistema" porque é o que o script do layout assume sem escolha
    // salva. O valor real vem do primeiro efeito, já no cliente.
    const [tema, setTema] = useState<Tema>("sistema");

    useEffect(() => {
        const salvo = localStorage.getItem(CHAVE_DO_TEMA) as Tema | null;
        if (salvo) setTema(salvo);
    }, []);

    // Enquanto a escolha for "sistema", acompanhar a mudança de preferência
    // do sistema operacional sem precisar recarregar.
    useEffect(() => {
        if (tema !== "sistema") return;
        const consulta = window.matchMedia("(prefers-color-scheme: dark)");
        const responder = () => aplicar("sistema");
        consulta.addEventListener("change", responder);
        return () => consulta.removeEventListener("change", responder);
    }, [tema]);

    const escolher = (novo: Tema) => {
        setTema(novo);
        localStorage.setItem(CHAVE_DO_TEMA, novo);
        aplicar(novo);
    };

    if (compacto) {
        const indice = OPCOES.findIndex((opcao) => opcao.valor === tema);
        const { rotulo, Icone } = OPCOES[indice];
        const proxima = OPCOES[(indice + 1) % OPCOES.length];

        return (
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => escolher(proxima.valor)}
                aria-label={`${rotulo}. Trocar para ${proxima.rotulo.toLowerCase()}`}
                title={`${rotulo} — clique para ${proxima.rotulo.toLowerCase()}`}
                className={className}
            >
                <Icone />
            </Button>
        );
    }

    return (
        <div
            role="radiogroup"
            aria-label="Tema"
            className={cn(
                "inline-flex items-center gap-0.5 rounded-4xl border border-border bg-card p-0.5",
                className,
            )}
        >
            {OPCOES.map(({ valor, rotulo, Icone }) => (
                <Button
                    key={valor}
                    role="radio"
                    aria-checked={tema === valor}
                    aria-label={rotulo}
                    title={rotulo}
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => escolher(valor)}
                    className={cn(
                        tema === valor &&
                            "bg-secondary text-secondary-foreground hover:bg-secondary",
                    )}
                >
                    <Icone />
                </Button>
            ))}
        </div>
    );
};
