"use client";

import { Search, UserPlus } from "lucide-react";
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
import { listarAtletas } from "@/src/lib/api/atletas";
import { adicionarAoElenco, listarEquipes } from "@/src/lib/api/equipes";
import { useAvisos } from "@/src/lib/avisos";
import { normalizar } from "@/src/lib/escopo";
import { Equipe } from "@/src/lib/types/equipe";

type Candidato = {
    id: number;
    nome: string;
    numCamisa?: number;
    idade?: number;
    /** A equipe de onde ele sai, ou nada quando está sem equipe. */
    equipe?: { id: number; nome: string; modalidade: string };
};

/**
 * Traz para o elenco um atleta que já está cadastrado.
 *
 * É o outro caminho de "adicionar ao elenco", e o que a tela precisa deixar
 * claro é que aqui ninguém é criado: o atleta existe, e o que muda é a equipe
 * dele. Por isso cada linha diz de onde ele sai.
 *
 * `GET /atleta` não informa a equipe de cada atleta, então a equipe vem do
 * cruzamento com `GET /equipe`, que traz o elenco aninhado.
 */
export const TrazerAtletaDialog = ({
    idEquipe,
    aoTrazer,
}: {
    idEquipe: number;
    aoTrazer: (equipe: Equipe) => void;
}) => {
    const avisos = useAvisos();

    const [aberto, setAberto] = useState(false);
    const [candidatos, setCandidatos] = useState<Candidato[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);
    const [busca, setBusca] = useState("");
    const [trazendo, setTrazendo] = useState<number | null>(null);

    const carregar = () => {
        setCarregando(true);
        setErro(null);
        Promise.all([listarAtletas(), listarEquipes()])
            .then(([atletas, equipes]) => {
                const equipeDoAtleta = new Map<number, Equipe>();
                for (const equipe of equipes) {
                    for (const atleta of equipe.atletas) {
                        equipeDoAtleta.set(atleta.id, equipe);
                    }
                }

                setCandidatos(
                    atletas
                        .filter((atleta) => equipeDoAtleta.get(atleta.id)?.id !== idEquipe)
                        .map((atleta) => {
                            const equipe = equipeDoAtleta.get(atleta.id);
                            return {
                                id: atleta.id,
                                nome: atleta.nome,
                                numCamisa: atleta.numCamisa,
                                idade: atleta.idade,
                                equipe: equipe
                                    ? {
                                          id: equipe.id,
                                          nome: equipe.nome,
                                          modalidade: equipe.modalidade.nome,
                                      }
                                    : undefined,
                            };
                        }),
                );
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(() => {
        if (!aberto) return;
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aberto, idEquipe]);

    const resultados = useMemo(() => {
        const termo = normalizar(busca);
        const ordenados = [...candidatos].sort((a, b) => {
            // Quem está sem equipe primeiro: trazer esses não desfalca
            // ninguém, e é o caso comum.
            if (!a.equipe !== !b.equipe) return a.equipe ? 1 : -1;
            return a.nome.localeCompare(b.nome, "pt-BR");
        });
        return termo
            ? ordenados.filter((atleta) => normalizar(atleta.nome).includes(termo))
            : ordenados;
    }, [candidatos, busca]);

    const trazer = async (candidato: Candidato) => {
        setTrazendo(candidato.id);
        try {
            const atualizada = await adicionarAoElenco(idEquipe, candidato.id);
            aoTrazer(atualizada);
            avisos.sucesso(`${candidato.nome} entrou no elenco.`);
            carregar();
        } catch (causa) {
            // A recusa por modalidade chega com a razão escrita pelo
            // servidor — "é de outra modalidade e não pode entrar em X".
            avisos.erro(causa);
        } finally {
            setTrazendo(null);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger
                render={
                    <Button size="sm" variant="outline">
                        <UserPlus />
                        Trazer atleta
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Trazer atleta que já existe</DialogTitle>
                    <DialogDescription>
                        Nenhum atleta é criado aqui: ele já está no cadastro e passa a fazer
                        parte deste elenco. Quem estiver em outra equipe sai dela. A modalidade
                        tem que ser a mesma da equipe.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 rounded-3xl border border-border px-4">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        value={busca}
                        onChange={(evento) => setBusca(evento.target.value)}
                        placeholder="Buscar pelo nome…"
                        aria-label="Buscar atleta"
                        className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <div className="max-h-[45vh] space-y-1.5 overflow-y-auto">
                    {erro ? (
                        <Erro causa={erro} aoTentarDeNovo={carregar} />
                    ) : carregando ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                        ))
                    ) : resultados.length === 0 ? (
                        <Vazio
                            conceito="atleta"
                            titulo={
                                busca
                                    ? "Nenhum atleta com esse nome"
                                    : "Nenhum atleta fora deste elenco"
                            }
                            descricao="Cadastre um atleta novo para começar o elenco."
                        />
                    ) : (
                        resultados.map((candidato) => (
                            <button
                                key={candidato.id}
                                type="button"
                                disabled={trazendo !== null}
                                onClick={() => trazer(candidato)}
                                className="flex w-full items-center gap-3 rounded-2xl border border-border px-3 py-2.5 text-left transition-colors hover:border-ring disabled:opacity-60"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">
                                        {candidato.nome}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {candidato.equipe
                                            ? `${candidato.equipe.nome} · ${candidato.equipe.modalidade}`
                                            : "Sem equipe"}
                                        {candidato.numCamisa ? ` · camisa ${candidato.numCamisa}` : ""}
                                        {candidato.idade ? ` · ${candidato.idade} anos` : ""}
                                    </span>
                                </span>
                                <span
                                    className={cn(
                                        "shrink-0 text-xs text-muted-foreground",
                                        trazendo === candidato.id && "text-foreground",
                                    )}
                                >
                                    {trazendo === candidato.id ? "Trazendo…" : "Trazer"}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
