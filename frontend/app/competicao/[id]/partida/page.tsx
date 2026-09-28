"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CriarPartidaDialog } from "@/src/features/partidas/CriarPartidaDialog";
import { ListaDePartidas } from "@/src/features/partidas/ListaDePartidas";
import { buscarCompeticao } from "@/src/lib/api/competicoes";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { useEscopo } from "@/src/lib/escopo";
import { Equipe } from "@/src/lib/types/equipe";
import { Partida } from "@/src/lib/types/partida";

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

type Situacao = "todas" | "agendada" | "encerrada";

const SITUACOES: { valor: Situacao; rotulo: string }[] = [
    { valor: "todas", rotulo: "Todas" },
    { valor: "agendada", rotulo: "Agendadas" },
    { valor: "encerrada", rotulo: "Encerradas" },
];

const classeDeEscolha =
    "h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-foreground outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:w-56";

/**
 * O calendário da competição inteira.
 *
 * Os filtros são de cliente porque as partidas de uma competição já vêm todas
 * numa chamada — filtrar no servidor seria uma ida a mais para recortar uma
 * lista que está na memória.
 *
 * Não há filtro por rodada: `GET /partida/competicao/{id}` não devolve
 * `rodada`, e a fase que vem é o formato (pontos corridos, grupos,
 * eliminatória), não o estágio. Oferecer o filtro era prometer um recorte que
 * o servidor não sabe fazer.
 */
const CalendarioPage = () => {
    const params = useParams<{ id: string }>();
    const id = Number(params?.id);
    const { atual } = useEscopo();

    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [equipesInscritas, setEquipesInscritas] = useState<Equipe[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const [equipe, setEquipe] = useState("todas");
    const [situacao, setSituacao] = useState<Situacao>("todas");

    const carregar = () => {
        if (!Number.isFinite(id)) return;
        setCarregando(true);
        setErro(null);
        Promise.all([listarPartidasDaCompeticao(id), buscarCompeticao(id)])
            .then(([suasPartidas, competicao]) => {
                setPartidas(suasPartidas);
                setEquipesInscritas(competicao.equipes);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, [id]);

    const substituir = (atualizada: Partida) =>
        setPartidas((todas) =>
            todas.map((partida) => (partida.id === atualizada.id ? atualizada : partida)),
        );

    // As equipes do filtro são as que aparecem nas partidas, não as inscritas:
    // quem não jogou nada não tem o que filtrar.
    const equipesNasPartidas = useMemo(() => {
        const nomes = new Set<string>();
        for (const partida of partidas) {
            if (partida.equipeMandante) nomes.add(partida.equipeMandante);
            if (partida.equipeVisitante) nomes.add(partida.equipeVisitante);
        }
        return [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }, [partidas]);

    const filtradas = useMemo(
        () =>
            partidas.filter((partida) => {
                if (
                    equipe !== "todas" &&
                    partida.equipeMandante !== equipe &&
                    partida.equipeVisitante !== equipe
                ) {
                    return false;
                }
                if (situacao === "agendada" && partida.realizada) return false;
                if (situacao === "encerrada" && !partida.realizada) return false;
                return true;
            }),
        [partidas, equipe, situacao],
    );

    const filtrando = equipe !== "todas" || situacao !== "todas";

    return (
        <>
            <CabecalhoDaPagina
                conceito="calendario"
                titulo="Calendário"
                descricao="Todas as partidas da competição, das agendadas às encerradas."
                migalhas={[
                    { rotulo: "Competições", href: "/competicao" },
                    ...(atual ? [{ rotulo: atual.nomeDaAdministracao }] : []),
                    ...(atual ? [{ rotulo: atual.nome, href: `/competicao/${id}` }] : []),
                    { rotulo: "Calendário" },
                ]}
                acoes={
                    <CriarPartidaDialog
                        idCompeticao={id}
                        equipes={equipesInscritas}
                        aoCriar={(criada) => setPartidas((todas) => [...todas, criada])}
                    />
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : (
                    <Secao
                        titulo={
                            carregando
                                ? "Partidas"
                                : filtrando
                                  ? `${filtradas.length} de ${partidas.length} partidas`
                                  : partidas.length === 1
                                    ? "1 partida"
                                    : `${partidas.length} partidas`
                        }
                    >
                        <div className="flex flex-col gap-3 rounded-3xl border border-border px-5 py-3 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="filtro-equipe"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Equipe
                                </label>
                                <select
                                    id="filtro-equipe"
                                    value={equipe}
                                    onChange={(evento) => setEquipe(evento.target.value)}
                                    className={classeDeEscolha}
                                >
                                    <option value="todas">Todas as equipes</option>
                                    {equipesNasPartidas.map((nome) => (
                                        <option key={nome} value={nome}>
                                            {nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div
                                className="flex flex-col gap-1.5"
                                role="group"
                                aria-label="Situação"
                            >
                                <span className="text-xs font-medium text-muted-foreground">
                                    Situação
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {SITUACOES.map(({ valor, rotulo }) => (
                                        <button
                                            key={valor}
                                            type="button"
                                            aria-pressed={situacao === valor}
                                            onClick={() => setSituacao(valor)}
                                            className={cn(
                                                "h-9 rounded-3xl border px-3 text-sm transition-colors",
                                                situacao === valor
                                                    ? "border-primary/40 bg-accent/60 font-medium"
                                                    : "border-border text-muted-foreground hover:border-ring",
                                            )}
                                        >
                                            {rotulo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {carregando ? (
                            <CarregandoLista linhas={6} />
                        ) : partidas.length === 0 ? (
                            <Vazio
                                conceito="calendario"
                                titulo="Calendário vazio"
                                descricao="Nenhuma partida nesta competição ainda. As fases geram os confrontos, e aqui dá para criar uma partida avulsa."
                                acao={
                                    <CriarPartidaDialog
                                        idCompeticao={id}
                                        equipes={equipesInscritas}
                                        aoCriar={(criada) =>
                                            setPartidas((todas) => [...todas, criada])
                                        }
                                    />
                                }
                            />
                        ) : filtradas.length === 0 ? (
                            <Vazio
                                conceito="partida"
                                titulo="Nenhuma partida com esse recorte"
                                descricao="Solte o filtro de equipe ou de situação para ver o calendário inteiro."
                            />
                        ) : (
                            <ListaDePartidas
                                partidas={filtradas}
                                idCompeticao={id}
                                aoAgendar={substituir}
                            />
                        )}
                    </Secao>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default CalendarioPage;
