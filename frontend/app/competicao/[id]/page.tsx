"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CarregandoCartoes, CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { InscreverEquipeDialog } from "@/src/features/campeonatos/InscreverEquipeDialog";
import { EditCompetitionForm } from "@/src/features/campeonatos/editCompetitionForm";
import { MatchCalendar } from "@/src/features/campeonatos/matchCalendar";
import { StandingsTable } from "@/src/features/campeonatos/StandingsTable";
import { TeamsList } from "@/src/features/campeonatos/teamsList";
import { buscarCompeticao, removerEquipeDaCompeticao } from "@/src/lib/api/competicoes";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { Competicao, ROTULO_DO_ESTADO } from "@/src/lib/types/competicao";
import { Equipe } from "@/src/lib/types/equipe";
import { Partida } from "@/src/lib/types/partida";
import { computeStandings } from "@/src/features/campeonatos/calculos";
import { ICONES } from "@/src/lib/icones";
import { useEscopo } from "@/src/lib/escopo";
import { formatarDiaEHora, porDataHora } from "@/src/lib/formato";
import { useAvisos } from "@/src/lib/avisos";

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

const CompeticaoDetalhePage = () => {
    const params = useParams<{ id: string }>();
    const id = Number(params?.id);
    const { atual } = useEscopo();
    const avisos = useAvisos();

    const [competicao, setCompeticao] = useState<Competicao | null>(null);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = () => {
        if (!Number.isFinite(id)) return;
        setCarregando(true);
        setErro(null);
        Promise.all([buscarCompeticao(id), listarPartidasDaCompeticao(id)])
            .then(([encontrada, suasPartidas]) => {
                setCompeticao(encontrada);
                setEquipes(encontrada.equipes);
                setPartidas(suasPartidas);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, [id]);

    const proximas = useMemo(
        () => partidas.filter((partida) => !partida.realizada).sort(porDataHora),
        [partidas],
    );

    const pontosCorridos = competicao ? !competicao.isMataMata : false;
    const classificacao = pontosCorridos ? computeStandings(partidas) : [];

    const IconePartida = ICONES.partida;

    return (
        <>
            <CabecalhoDaPagina
                conceito="competicao"
                titulo={competicao?.nome ?? atual?.nome ?? "Competição"}
                descricao={
                    competicao
                        ? [competicao.modalidade, competicao.categoria].filter(Boolean).join(" · ")
                        : undefined
                }
                migalhas={[
                    { rotulo: "Competições", href: "/competicao" },
                    ...(atual ? [{ rotulo: atual.nomeDaAdministracao }] : []),
                ]}
                acoes={
                    competicao?.estado && (
                        <Badge
                            variant={
                                competicao.estado === "EM_ANDAMENTO"
                                    ? "default"
                                    : competicao.estado === "CANCELADA"
                                      ? "destructive"
                                      : "secondary"
                            }
                        >
                            {ROTULO_DO_ESTADO[competicao.estado]}
                        </Badge>
                    )
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6">
                            {/* Os próximos jogos vivem aqui, e não numa lista
                                geral: fora da competição eles não diziam de
                                qual competição eram. */}
                            <Secao titulo="Próximos jogos">
                                {carregando ? (
                                    <CarregandoLista linhas={3} />
                                ) : proximas.length === 0 ? (
                                    <Vazio
                                        conceito="partida"
                                        titulo="Nenhum jogo agendado"
                                        descricao="As partidas aparecem quando uma fase gera os confrontos."
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        {proximas.slice(0, 6).map((partida) => (
                                            <Link
                                                key={partida.id}
                                                href={`/partida/${partida.id}`}
                                                className="block"
                                            >
                                                <Card className="transition-colors hover:border-ring">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-start gap-2 text-sm">
                                                            <IconePartida className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                            <span className="min-w-0">
                                                                {partida.equipeMandante} ×{" "}
                                                                {partida.equipeVisitante}
                                                            </span>
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {formatarDiaEHora(partida.dataHora)}
                                                            {partida.local ? ` · ${partida.local}` : ""}
                                                        </CardDescription>
                                                    </CardHeader>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </Secao>

                            <Secao
                                titulo="Equipes inscritas"
                                acao={
                                    <InscreverEquipeDialog
                                        idCompeticao={id}
                                        jaInscritas={equipes}
                                        aoInscrever={(atualizada) =>
                                            setEquipes(atualizada.equipes)
                                        }
                                    />
                                }
                            >
                                {carregando ? (
                                    <CarregandoLista linhas={4} />
                                ) : equipes.length === 0 ? (
                                    <Vazio
                                        conceito="equipe"
                                        titulo="Nenhuma equipe inscrita"
                                        descricao="Inscreva as equipes que vão disputar."
                                    />
                                ) : (
                                    <TeamsList
                                        equipes={equipes}
                                        aoRemover={async (equipe) => {
                                            try {
                                                const atualizada =
                                                    await removerEquipeDaCompeticao(id, equipe.id);
                                                setEquipes(atualizada.equipes);
                                                avisos.sucesso(
                                                    `${equipe.nome} saiu da competição.`,
                                                );
                                            } catch (causa) {
                                                avisos.erro(causa);
                                            }
                                        }}
                                    />
                                )}
                            </Secao>
                        </div>

                        <div className="lg:col-span-2">
                            {carregando ? (
                                <CarregandoCartoes cartoes={3} />
                            ) : (
                                <Tabs defaultValue="classificacao">
                                    <TabsList>
                                        <TabsTrigger value="classificacao">
                                            {pontosCorridos ? "Classificação" : "Chaveamento"}
                                        </TabsTrigger>
                                        <TabsTrigger value="calendario">Calendário</TabsTrigger>
                                        <TabsTrigger value="dados">Dados</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="classificacao" className="pt-4">
                                        {pontosCorridos ? (
                                            <StandingsTable standings={classificacao} />
                                        ) : (
                                            <Vazio
                                                conceito="chaveamento"
                                                titulo="Chaveamento ainda não disponível"
                                                descricao="A API informa o formato da fase, mas não em que estágio da eliminatória cada partida está. A chave entra quando a fase vier na resposta da partida."
                                            />
                                        )}
                                    </TabsContent>

                                    <TabsContent value="calendario" className="pt-4">
                                        {partidas.length === 0 ? (
                                            <Vazio
                                                conceito="calendario"
                                                titulo="Calendário vazio"
                                                descricao="Nenhuma partida gerada nesta competição."
                                            />
                                        ) : (
                                            <MatchCalendar matches={partidas} />
                                        )}
                                    </TabsContent>

                                    <TabsContent value="dados" className="pt-4">
                                        {competicao && <EditCompetitionForm competicao={competicao} />}
                                    </TabsContent>
                                </Tabs>
                            )}
                        </div>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default CompeticaoDetalhePage;
