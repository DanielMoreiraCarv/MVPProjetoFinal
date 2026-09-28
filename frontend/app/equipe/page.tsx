"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CarregandoCartoes, Erro, Vazio } from "@/src/components/estado/Estados";
import { EquipeDialog } from "@/src/features/equipes/EquipeDialog";
import { listarEquipes } from "@/src/lib/api/equipes";
import { listarModalidades, Modalidade } from "@/src/lib/api/modalidades";
import { normalizar } from "@/src/lib/escopo";
import { ICONES } from "@/src/lib/icones";
import { Equipe } from "@/src/lib/types/equipe";

/**
 * O cadastro de equipes, fora de qualquer competição.
 *
 * Equipe existe por si e disputa mais de uma competição, então ela não podia
 * morar dentro de `/competicao/[id]`: a mesma equipe apareceria como três
 * cadastros diferentes em três competições.
 */

const TODAS = "todas";

const Secao = ({
    titulo,
    acao,
    className,
    children,
}: {
    titulo: string;
    acao?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section className={cn("space-y-3", className)}>
        <div className="flex min-h-9 items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {titulo}
            </h2>
            {acao}
        </div>
        {children}
    </section>
);

const EquipePage = () => {
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [modalidades, setModalidades] = useState<Modalidade[]>([]);
    const [modalidade, setModalidade] = useState<string[]>([TODAS]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const idModalidade = modalidade[0] !== TODAS ? Number(modalidade[0]) : undefined;

    // O filtro por modalidade é do servidor — a rota aceita `idModalidade` e
    // não faz sentido trazer 200 equipes para esconder 180 no cliente. A busca
    // por nome é do cliente: ela muda a cada tecla.
    const carregar = useCallback(() => {
        setCarregando(true);
        setErro(null);
        listarEquipes(idModalidade)
            .then(setEquipes)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idModalidade]);

    useEffect(carregar, [carregar]);

    useEffect(() => {
        listarModalidades().then(setModalidades).catch(() => setModalidades([]));
    }, []);

    const resultados = useMemo(() => {
        const termo = normalizar(busca);
        return equipes
            .filter((equipe) => !termo || normalizar(equipe.nome).includes(termo))
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }, [equipes, busca]);

    const IconeEquipe = ICONES.equipe;

    return (
        <>
            <CabecalhoDaPagina
                conceito="equipe"
                titulo="Equipes"
                descricao="O cadastro das equipes. Cada uma existe fora da competição e pode disputar várias."
                migalhas={[{ rotulo: "Cadastro" }, { rotulo: "Equipes" }]}
                acoes={<EquipeDialog aoSalvar={carregar} />}
            />
            <CorpoDaPagina>
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex flex-1 items-center gap-2 rounded-3xl border border-border px-4">
                            <Search className="size-4 shrink-0 text-muted-foreground" />
                            <input
                                value={busca}
                                onChange={(evento) => setBusca(evento.target.value)}
                                placeholder="Buscar equipe pelo nome…"
                                aria-label="Buscar equipe"
                                className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                        </div>

                        <ToggleGroup
                            value={modalidade}
                            onValueChange={(valor) => valor.length > 0 && setModalidade(valor)}
                            spacing={0}
                            variant="outline"
                            className="flex-wrap"
                            aria-label="Filtrar por modalidade"
                        >
                            <ToggleGroupItem value={TODAS}>Todas</ToggleGroupItem>
                            {modalidades.map((m) => (
                                <ToggleGroupItem key={m.id} value={String(m.id)}>
                                    {m.nome}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <Secao
                        titulo={
                            carregando
                                ? "Equipes"
                                : resultados.length === 1
                                  ? "1 equipe"
                                  : `${resultados.length} equipes`
                        }
                    >
                        {erro ? (
                            <Erro causa={erro} aoTentarDeNovo={carregar} />
                        ) : carregando ? (
                            <CarregandoCartoes cartoes={6} />
                        ) : resultados.length === 0 ? (
                            <Vazio
                                conceito="equipe"
                                titulo={
                                    busca
                                        ? "Nenhuma equipe com esse nome"
                                        : idModalidade
                                          ? "Nenhuma equipe nesta modalidade"
                                          : "Nenhuma equipe cadastrada"
                                }
                                descricao={
                                    busca
                                        ? "Tente outro trecho do nome, ou limpe a busca."
                                        : "Cadastre a primeira equipe para poder inscrevê-la numa competição."
                                }
                                acao={busca ? undefined : <EquipeDialog aoSalvar={carregar} />}
                            />
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {resultados.map((equipe) => (
                                    <Link
                                        key={equipe.id}
                                        href={`/equipe/${equipe.id}`}
                                        className="block h-full"
                                    >
                                        <Card className="h-full transition-colors hover:border-ring">
                                            <CardHeader>
                                                <CardTitle className="flex items-start gap-2">
                                                    <IconeEquipe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <span className="min-w-0">{equipe.nome}</span>
                                                </CardTitle>
                                                <CardDescription>
                                                    {equipe.modalidade.nome || "Sem modalidade"}
                                                    {equipe.federacao
                                                        ? ` · ${equipe.federacao.nome}`
                                                        : ""}
                                                </CardDescription>
                                                <CardDescription>
                                                    <Badge variant="secondary">
                                                        {equipe.atletas.length}{" "}
                                                        {equipe.atletas.length === 1
                                                            ? "atleta"
                                                            : "atletas"}
                                                    </Badge>
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Secao>
                </div>
            </CorpoDaPagina>
        </>
    );
};

export default EquipePage;
