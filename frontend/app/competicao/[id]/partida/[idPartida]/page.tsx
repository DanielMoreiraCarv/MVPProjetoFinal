"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro } from "@/src/components/estado/Estados";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { AgendarPartidaDialog } from "@/src/features/partidas/AgendarPartidaDialog";
import { EscalarArbitroDialog } from "@/src/features/partidas/EscalarArbitroDialog";
import { RegistrarPlacarDialog } from "@/src/features/partidas/RegistrarPlacarDialog";
import { buscarPartida, finalizarPartida } from "@/src/lib/api/partidas";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";
import { formatarDataHora, formatarDiaDaSemana } from "@/src/lib/formato";
import { ICONES } from "@/src/lib/icones";
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

const Dado = ({ rotulo, valor }: { rotulo: string; valor: string }) => (
    <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{rotulo}</p>
        <p className="text-sm font-medium">{valor}</p>
    </div>
);

const PartidaPage = () => {
    const params = useParams<{ id: string; idPartida: string }>();
    const idCompeticao = Number(params?.id);
    const idPartida = Number(params?.idPartida);
    const { atual } = useEscopo();
    const avisos = useAvisos();

    const [partida, setPartida] = useState<Partida | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = () => {
        if (!Number.isFinite(idPartida)) return;
        setCarregando(true);
        setErro(null);
        buscarPartida(idPartida).then(setPartida).catch(setErro).finally(() => setCarregando(false));
    };

    useEffect(carregar, [idPartida]);

    const encerrar = async () => {
        if (!partida) return;
        try {
            setPartida(await finalizarPartida(partida.id));
            avisos.sucesso("Partida encerrada.");
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const IconeSumula = ICONES.sumula;
    const encerrada = partida?.realizada ?? false;

    return (
        <>
            <CabecalhoDaPagina
                conceito="partida"
                titulo={
                    partida
                        ? `${partida.equipeMandante} × ${partida.equipeVisitante}`
                        : "Partida"
                }
                descricao={partida?.nomeCompeticao || undefined}
                migalhas={[
                    { rotulo: "Competições", href: "/competicao" },
                    ...(atual ? [{ rotulo: atual.nomeDaAdministracao }] : []),
                    ...(atual
                        ? [{ rotulo: atual.nome, href: `/competicao/${idCompeticao}` }]
                        : []),
                    { rotulo: "Calendário", href: `/competicao/${idCompeticao}/partida` },
                    { rotulo: "Partida" },
                ]}
                acoes={
                    partida && (
                        <Badge variant={encerrada ? "secondary" : "outline"}>
                            {encerrada ? "Encerrada" : "Agendada"}
                        </Badge>
                    )
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : carregando || !partida ? (
                    <CarregandoLista linhas={4} />
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border px-5 py-8 sm:flex-row sm:justify-center sm:gap-8">
                            <p className="min-w-0 flex-1 text-center text-lg font-semibold sm:text-right">
                                {partida.equipeMandante}
                            </p>
                            <p className="numero-tabular shrink-0 font-mono text-4xl font-bold tracking-tight">
                                {partida.placarMandante ?? 0}
                                <span className="px-2 text-muted-foreground">×</span>
                                {partida.placarVisitante ?? 0}
                            </p>
                            <p className="min-w-0 flex-1 text-center text-lg font-semibold sm:text-left">
                                {partida.equipeVisitante}
                            </p>
                        </div>

                        {encerrada && partida.vencedor && (
                            <p className="text-center text-sm text-muted-foreground">
                                Venceu <span className="font-medium text-foreground">
                                    {partida.vencedor}
                                </span>
                                .
                            </p>
                        )}

                        <Secao titulo="Dados da partida">
                            <div className="grid gap-x-6 gap-y-4 rounded-3xl border border-border px-5 py-4 sm:grid-cols-3">
                                <Dado
                                    rotulo="Data e hora"
                                    valor={formatarDataHora(partida.dataHora)}
                                />
                                <Dado
                                    rotulo="Dia da semana"
                                    valor={formatarDiaDaSemana(partida.dataHora) || "—"}
                                />
                                <Dado rotulo="Local" valor={partida.local ?? "A definir"} />
                                <Dado rotulo="Fase" valor={partida.fase ?? "—"} />
                                <Dado
                                    rotulo="Árbitro"
                                    valor={partida.arbitro ?? "Ninguém escalado"}
                                />
                                <Dado
                                    rotulo="Situação"
                                    valor={encerrada ? "Encerrada" : "Agendada"}
                                />
                            </div>
                        </Secao>

                        <Secao titulo="Ações">
                            <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border px-5 py-3">
                                {/* Depois de encerrada a API recusa placar e
                                    troca de árbitro. O botão desabilitado diz
                                    isso antes de a pessoa tentar. */}
                                {encerrada ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            title="A partida já foi encerrada e não aceita alteração de placar."
                                        >
                                            Registrar placar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            title="A partida já foi encerrada e não aceita troca de árbitro."
                                        >
                                            Trocar árbitro
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <RegistrarPlacarDialog
                                            partida={partida}
                                            aoRegistrar={setPartida}
                                        />
                                        <EscalarArbitroDialog
                                            partida={partida}
                                            aoEscalar={setPartida}
                                        />
                                    </>
                                )}

                                <AgendarPartidaDialog partida={partida} aoAgendar={setPartida} />

                                {encerrada ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled
                                        title="A partida já foi encerrada."
                                    >
                                        Encerrar partida
                                    </Button>
                                ) : (
                                    <Confirmacao
                                        gatilho={
                                            <Button variant="destructive" size="sm">
                                                Encerrar partida
                                            </Button>
                                        }
                                        titulo="Encerrar a partida?"
                                        descricao={`O resultado ${partida.placarMandante ?? 0} × ${partida.placarVisitante ?? 0} fica valendo e entra na classificação. Depois disso o placar não muda mais e o árbitro não pode ser trocado — encerrar é definitivo.`}
                                        rotuloDaAcao="Encerrar partida"
                                        aoConfirmar={encerrar}
                                    />
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto"
                                    nativeButton={false}
                                    render={
                                        <Link
                                            href={`/competicao/${idCompeticao}/partida/${partida.id}/sumula`}
                                        />
                                    }
                                >
                                    <IconeSumula />
                                    Ver súmula
                                </Button>
                            </div>
                        </Secao>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default PartidaPage;
