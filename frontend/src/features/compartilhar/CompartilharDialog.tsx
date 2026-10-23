"use client";

import { Check, Copy, ExternalLink, Globe, Lock, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
    enderecoPublicoDaCompeticao,
    enderecoPublicoDaPartida,
} from "@/src/lib/visao-publica";

type Alvo = "partida" | "competicao";

export type CompeticaoCompartilhada = { id: number; nome: string; publica?: boolean };

/**
 * O mesmo diálogo na gestão e no acompanhamento. Na gestão ele também abre e
 * fecha a competição ao público — é aqui que a pessoa percebe que o link não
 * funciona enquanto ela estiver privada, então a chave fica junto do link.
 *
 * Com uma partida, o link padrão é o dela: quem recebe cai direto no placar e
 * dali navega pela competição inteira.
 */
export const CompartilharDialog = ({
    competicao,
    partida,
    aoMudarVisibilidade,
    gatilho = (
        <Button variant="outline" size="sm">
            <Share2 />
            Compartilhar
        </Button>
    ),
}: {
    competicao: CompeticaoCompartilhada;
    partida?: { id: number; rotulo: string };
    /** Só na gestão. Ausente, a competição é tratada como já aberta. */
    aoMudarVisibilidade?: (publica: boolean) => Promise<void>;
    gatilho?: React.ReactElement;
}) => {
    const [aberto, setAberto] = useState(false);
    const [alvo, setAlvo] = useState<Alvo>(partida ? "partida" : "competicao");
    const [copiado, setCopiado] = useState(false);
    const [mudando, setMudando] = useState(false);

    // O conteúdo só existe com o diálogo aberto, já no navegador: no servidor
    // estes dois nunca chegam a ser desenhados.
    const noNavegador = typeof window !== "undefined";
    const origem = noNavegador ? window.location.origin : "";
    const podeCompartilharNativo = noNavegador && typeof navigator.share === "function";

    useEffect(() => {
        if (!copiado) return;
        const id = window.setTimeout(() => setCopiado(false), 2000);
        return () => window.clearTimeout(id);
    }, [copiado]);

    const publica = aoMudarVisibilidade ? Boolean(competicao.publica) : true;
    const caminho =
        alvo === "partida" && partida
            ? enderecoPublicoDaPartida(competicao.id, partida.id)
            : enderecoPublicoDaCompeticao(competicao.id);
    const endereco = `${origem}${caminho}`;
    const titulo =
        alvo === "partida" && partida ? `${partida.rotulo} · ${competicao.nome}` : competicao.nome;

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(endereco);
        } catch {
            // Sem permissão de área de transferência (http sem TLS, iframe):
            // o campo fica selecionado para o Ctrl+C manual.
            document.querySelector<HTMLInputElement>("#endereco-publico")?.select();
            return;
        }
        setCopiado(true);
    };

    const compartilharNativo = () =>
        navigator.share({ title: titulo, text: `Acompanhe ${titulo}`, url: endereco }).catch(() => {
            // Fechar a folha de compartilhamento também cai aqui.
        });

    const mudarVisibilidade = async () => {
        if (!aoMudarVisibilidade) return;
        setMudando(true);
        try {
            await aoMudarVisibilidade(!publica);
        } finally {
            setMudando(false);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger render={gatilho} />
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Compartilhar</DialogTitle>
                    <DialogDescription>
                        Quem abrir o link acompanha placar, partidas e classificação, sem login e sem
                        poder alterar nada.
                    </DialogDescription>
                </DialogHeader>

                {aoMudarVisibilidade && (
                    <div
                        className={cn(
                            "flex items-center gap-3 rounded-2xl border px-4 py-3",
                            publica ? "border-success/40 bg-success/5" : "border-border bg-muted/40",
                        )}
                    >
                        <span
                            className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                                publica
                                    ? "bg-success text-success-foreground"
                                    : "bg-muted text-muted-foreground",
                            )}
                        >
                            {publica ? <Globe className="size-4" /> : <Lock className="size-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                                {publica ? "Aberta ao público" : "Competição privada"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {publica
                                    ? "Qualquer pessoa com o link acompanha."
                                    : "Ninguém de fora vê. Abra para o link funcionar."}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant={publica ? "outline" : "default"}
                            disabled={mudando}
                            onClick={mudarVisibilidade}
                        >
                            {mudando ? "Aguarde…" : publica ? "Tornar privada" : "Abrir ao público"}
                        </Button>
                    </div>
                )}

                {partida && (
                    <ToggleGroup
                        value={[alvo]}
                        onValueChange={(valor) => valor.length > 0 && setAlvo(valor[0] as Alvo)}
                        variant="outline"
                        aria-label="O que compartilhar"
                        className="w-full"
                    >
                        <ToggleGroupItem value="partida" className="flex-1">
                            Esta partida
                        </ToggleGroupItem>
                        <ToggleGroupItem value="competicao" className="flex-1">
                            A competição
                        </ToggleGroupItem>
                    </ToggleGroup>
                )}

                <div className={cn("space-y-3", !publica && "pointer-events-none opacity-50")}>
                    <div className="flex items-center gap-2">
                        <input
                            id="endereco-publico"
                            readOnly
                            value={endereco}
                            aria-label="Link público"
                            onFocus={(evento) => evento.currentTarget.select()}
                            className="h-9 min-w-0 flex-1 rounded-2xl border border-border bg-muted/40 px-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                        <Button size="sm" onClick={copiar} disabled={!publica} className="shrink-0">
                            {copiado ? <Check /> : <Copy />}
                            {copiado ? "Copiado" : "Copiar"}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            disabled={!publica}
                            render={
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Acompanhe ${titulo}: ${endereco}`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                />
                            }
                        >
                            <MessageCircle />
                            WhatsApp
                        </Button>
                        {podeCompartilharNativo && (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!publica}
                                onClick={compartilharNativo}
                            >
                                <Share2 />
                                Mais opções
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            nativeButton={false}
                            disabled={!publica}
                            className="ml-auto"
                            render={<a href={caminho} target="_blank" rel="noreferrer" />}
                        >
                            <ExternalLink />
                            Abrir
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
