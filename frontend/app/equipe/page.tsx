"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { Escolha } from "@/src/components/Escolha";
import { Monograma } from "@/src/components/Monograma";
import { CarregandoCartoes, Erro, Vazio } from "@/src/components/estado/Estados";
import { EquipeDialog } from "@/src/features/equipes/EquipeDialog";
import { listarEquipes } from "@/src/lib/api/equipes";
import { listarModalidades, Modalidade } from "@/src/lib/api/modalidades";
import { normalizar } from "@/src/lib/escopo";
import { Equipe } from "@/src/lib/types/equipe";

/**
 * O cadastro de equipes, fora de qualquer competição.
 *
 * Equipe existe por si e disputa mais de uma competição, então ela não podia
 * morar dentro de `/competicao/[id]`: a mesma equipe apareceria como três
 * cadastros diferentes em três competições.
 */

const TODAS = "todas";

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


    return (
        <>
            <CabecalhoDaPagina
                conceito="equipe"
                titulo="Equipes"
                descricao="O cadastro das equipes. Cada uma existe fora da competição e pode disputar várias."
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

                        <Escolha
                            valor={modalidade[0]}
                            aoMudar={(valor) => setModalidade([valor || TODAS])}
                            className="sm:w-56"
                            opcoes={[
                                { valor: TODAS, rotulo: "Todas as modalidades" },
                                ...modalidades.map((m) => ({ valor: String(m.id), rotulo: m.nome })),
                            ]}
                        />
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
                            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {resultados.map((equipe) => (
                                    <li key={equipe.id}>
                                        <Link
                                            href={`/equipe/${equipe.id}`}
                                            className="flex items-center gap-3 rounded-2xl border border-border px-3 py-2.5 transition-colors hover:border-ring"
                                        >
                                            <Monograma nome={equipe.nome} />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium">
                                                    {equipe.nome}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {[
                                                        equipe.modalidade.nome || "Sem modalidade",
                                                        equipe.federacao?.nome,
                                                        `${equipe.atletas.length} ${equipe.atletas.length === 1 ? "atleta" : "atletas"}`,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Secao>
                </div>
            </CorpoDaPagina>
        </>
    );
};

export default EquipePage;
