"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro } from "@/src/components/estado/Estados";
import {
    CabecalhoDaPagina,
    CorpoDaPagina,
    migalhasDaCompeticao,
} from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { AgendarPartidaDialog } from "@/src/features/partidas/AgendarPartidaDialog";
import { EscalarArbitroDialog } from "@/src/features/partidas/EscalarArbitroDialog";
import { PartidaDialog } from "@/src/features/partidas/PartidaDialog";
import { RegistrarPlacarDialog } from "@/src/features/partidas/RegistrarPlacarDialog";
import { buscarCompeticao } from "@/src/lib/api/competicoes";
import { buscarPartida, finalizarPartida, removerPartida } from "@/src/lib/api/partidas";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";
import { formatarDataHora, formatarDiaDaSemana } from "@/src/lib/formato";
import { ICONES } from "@/src/lib/icones";
import { Equipe } from "@/src/lib/types/equipe";
import { Partida } from "@/src/lib/types/partida";

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
    const router = useRouter();

    const [partida, setPartida] = useState<Partida | null>(null);
    const [inscritas, setInscritas] = useState<Equipe[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = () => {
        if (!Number.isFinite(idPartida)) return;
        setCarregando(true);
        setErro(null);
        Promise.all([buscarPartida(idPartida), buscarCompeticao(idCompeticao)])
            .then(([encontrada, competicao]) => {
                setPartida(encontrada);
                setInscritas(competicao.equipes);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
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

    const excluir = async () => {
        try {
            await removerPartida(idPartida);
            avisos.sucesso("Partida excluída.");
            router.push(`/competicao/${idCompeticao}/partida`);
        } catch (causa) {
            avisos.erro(causa, "Não foi possível excluir");
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
                migalhas={migalhasDaCompeticao(atual, { rotulo: "Calendário", href: `/competicao/${idCompeticao}/partida` })}
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

                        <Secao
                            titulo="Ações"
                            descricao={
                                encerrada
                                    ? "Encerrada, a partida não aceita mais placar nem troca de árbitro."
                                    : undefined
                            }
                        >
                            <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border px-5 py-3">
                                {!encerrada && (
                                    <>
                                        <RegistrarPlacarDialog
                                            partida={partida}
                                            aoRegistrar={setPartida}
                                        />
                                        <EscalarArbitroDialog
                                            partida={partida}
                                            aoEscalar={setPartida}
                                        />
                                        <AgendarPartidaDialog partida={partida} aoAgendar={setPartida} />
                                        <PartidaDialog
                                            idCompeticao={idCompeticao}
                                            equipes={inscritas}
                                            partida={partida}
                                            aoSalvar={setPartida}
                                        />
                                    </>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    nativeButton={false}
                                    render={
                                        <Link
                                            href={`/competicao/${idCompeticao}/partida/${partida.id}/sumula`}
                                        />
                                    }
                                >
                                    <IconeSumula />
                                    Súmula
                                </Button>

                                <span className="ml-auto flex items-center gap-2">
                                    {!encerrada && (
                                        <Confirmacao
                                            gatilho={<Button size="sm">Encerrar partida</Button>}
                                            titulo="Encerrar a partida?"
                                            descricao={`O resultado ${partida.placarMandante ?? 0} × ${partida.placarVisitante ?? 0} fica valendo e entra na classificação. Depois disso o placar não muda mais e o árbitro não pode ser trocado — encerrar é definitivo.`}
                                            rotuloDaAcao="Encerrar partida"
                                            destrutiva={false}
                                            aoConfirmar={encerrar}
                                        />
                                    )}
                                    <Confirmacao
                                        gatilho={
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label="Excluir partida"
                                                title="Excluir partida"
                                            >
                                                <Trash2 />
                                            </Button>
                                        }
                                        titulo="Excluir a partida?"
                                        descricao={
                                            encerrada
                                                ? "O resultado sai da classificação junto com ela. Não dá para desfazer."
                                                : "A partida sai do calendário. Não dá para desfazer."
                                        }
                                        rotuloDaAcao="Excluir partida"
                                        aoConfirmar={excluir}
                                    />
                                </span>
                            </div>
                        </Secao>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default PartidaPage;
