"use client";

import { Check, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Erro, Vazio } from "@/src/components/estado/Estados";
import { Arbitro, listarArbitros } from "@/src/lib/api/arbitros";
import { escalarArbitro } from "@/src/lib/api/partidas";
import { useAvisos } from "@/src/lib/avisos";
import { normalizar } from "@/src/lib/escopo";
import { Partida } from "@/src/lib/types/partida";

/**
 * Escolhe entre os árbitros cadastrados — a partida guarda quem apita, não um
 * nome digitado à mão.
 */
export const EscalarArbitroDialog = ({
    partida,
    aoEscalar,
}: {
    partida: Partida;
    aoEscalar: (partida: Partida) => void;
}) => {
    const [aberto, setAberto] = useState(false);
    const [arbitros, setArbitros] = useState<Arbitro[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);
    const [busca, setBusca] = useState("");
    const [escalando, setEscalando] = useState<number | null>(null);
    const avisos = useAvisos();

    useEffect(() => {
        if (!aberto) return;
        setCarregando(true);
        setErro(null);
        listarArbitros()
            .then(setArbitros)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [aberto]);

    const resultados = useMemo(() => {
        const termo = normalizar(busca);
        return arbitros.filter((arbitro) => !termo || normalizar(arbitro.nome).includes(termo));
    }, [arbitros, busca]);

    const escalar = async (arbitro: Arbitro) => {
        setEscalando(arbitro.id);
        try {
            const atualizada = await escalarArbitro(partida.id, arbitro.id);
            aoEscalar(atualizada);
            avisos.sucesso(`${arbitro.nome} vai apitar.`);
            setAberto(false);
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setEscalando(null);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
                {partida.arbitro ? "Trocar árbitro" : "Escalar árbitro"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Escalar árbitro</DialogTitle>
                    <DialogDescription>
                        {partida.arbitro
                            ? `Hoje quem apita é ${partida.arbitro}.`
                            : "Escolha entre os árbitros cadastrados."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 rounded-3xl border border-border px-4">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        value={busca}
                        onChange={(evento) => setBusca(evento.target.value)}
                        placeholder="Buscar pelo nome…"
                        aria-label="Buscar árbitro"
                        className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <div className="max-h-[45vh] space-y-1.5 overflow-y-auto">
                    {erro ? (
                        <Erro causa={erro} />
                    ) : carregando ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                        ))
                    ) : resultados.length === 0 ? (
                        <Vazio
                            conceito="arbitro"
                            titulo={
                                arbitros.length === 0
                                    ? "Nenhum árbitro cadastrado"
                                    : "Nenhum árbitro com esse nome"
                            }
                            descricao="Árbitro é cadastro próprio, fora da competição."
                        />
                    ) : (
                        resultados.map((arbitro) => {
                            const escalado = arbitro.nome === partida.arbitro;
                            return (
                                <button
                                    key={arbitro.id}
                                    type="button"
                                    disabled={escalado || escalando !== null}
                                    onClick={() => escalar(arbitro)}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-2xl border border-border px-3 py-2.5 text-left transition-colors",
                                        escalado
                                            ? "opacity-60"
                                            : "hover:border-ring disabled:opacity-60",
                                    )}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium">
                                            {arbitro.nome}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {[
                                                arbitro.federacao,
                                                `${arbitro.partidasApitadas} ${
                                                    arbitro.partidasApitadas === 1
                                                        ? "partida apitada"
                                                        : "partidas apitadas"
                                                }`,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </span>
                                    </span>
                                    {escalado && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Check className="size-3.5" />
                                            escalado
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
