"use client";

import { Check, Plus, Search } from "lucide-react";
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
import { inscreverEquipe } from "@/src/lib/api/competicoes";
import { listarEquipes } from "@/src/lib/api/equipes";
import { useAvisos } from "@/src/lib/avisos";
import { normalizar } from "@/src/lib/escopo";
import { Competicao } from "@/src/lib/types/competicao";
import { Equipe } from "@/src/lib/types/equipe";

/**
 * Inscreve uma equipe que já existe.
 *
 * O que havia aqui antes pedia um nome e criava uma equipe de mentira em
 * estado local, com `id: Date.now()`: sumia no recarregar e nunca chegou ao
 * servidor. Equipe é cadastro próprio — ela existe fora da competição e
 * disputa mais de uma — então o que esta tela faz é escolher entre as que
 * existem, não inventar outra.
 */
export const InscreverEquipeDialog = ({
    idCompeticao,
    jaInscritas,
    aoInscrever,
}: {
    idCompeticao: number;
    jaInscritas: Equipe[];
    aoInscrever: (competicao: Competicao) => void;
}) => {
    const [aberto, setAberto] = useState(false);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);
    const [busca, setBusca] = useState("");
    const [inscrevendo, setInscrevendo] = useState<number | null>(null);
    const avisos = useAvisos();

    useEffect(() => {
        if (!aberto) return;
        setCarregando(true);
        setErro(null);
        listarEquipes().then(setEquipes).catch(setErro).finally(() => setCarregando(false));
    }, [aberto]);

    const inscritas = useMemo(
        () => new Set(jaInscritas.map((equipe) => equipe.id)),
        [jaInscritas],
    );

    const resultados = useMemo(() => {
        const termo = normalizar(busca);
        return equipes.filter((equipe) => !termo || normalizar(equipe.nome).includes(termo));
    }, [equipes, busca]);

    const inscrever = async (equipe: Equipe) => {
        setInscrevendo(equipe.id);
        try {
            const atualizada = await inscreverEquipe(idCompeticao, equipe.id);
            aoInscrever(atualizada);
            avisos.sucesso(`${equipe.nome} inscrita.`);
        } catch (causa) {
            // A recusa por modalidade chega aqui com a razão escrita pelo
            // servidor — "é de outra modalidade e não pode disputar X".
            avisos.erro(causa);
        } finally {
            setInscrevendo(null);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger render={<Button size="sm" />}>
                <Plus />
                Inscrever equipe
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Inscrever equipe</DialogTitle>
                    <DialogDescription>
                        Escolha entre as equipes já cadastradas. A modalidade tem que ser a
                        mesma da competição.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 rounded-3xl border border-border px-4">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        value={busca}
                        onChange={(evento) => setBusca(evento.target.value)}
                        placeholder="Buscar pelo nome…"
                        aria-label="Buscar equipe"
                        className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <div className="max-h-[45vh] space-y-1.5 overflow-y-auto">
                    {erro ? (
                        <Erro causa={erro} />
                    ) : carregando ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                        ))
                    ) : resultados.length === 0 ? (
                        <Vazio
                            conceito="equipe"
                            titulo="Nenhuma equipe com esse nome"
                            descricao="As equipes são cadastradas fora da competição."
                        />
                    ) : (
                        resultados.map((equipe) => {
                            const dentro = inscritas.has(equipe.id);
                            return (
                                <button
                                    key={equipe.id}
                                    type="button"
                                    disabled={dentro || inscrevendo !== null}
                                    onClick={() => inscrever(equipe)}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-2xl border border-border px-3 py-2.5 text-left transition-colors",
                                        dentro
                                            ? "opacity-60"
                                            : "hover:border-ring disabled:opacity-60",
                                    )}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium">
                                            {equipe.nome}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {equipe.modalidade.nome} · {equipe.atletas.length}{" "}
                                            {equipe.atletas.length === 1 ? "atleta" : "atletas"}
                                        </span>
                                    </span>
                                    {dentro && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Check className="size-3.5" />
                                            inscrita
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
