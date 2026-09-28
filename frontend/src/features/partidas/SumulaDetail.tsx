"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buscarPartida } from "@/src/lib/api/partidas";
import { buscarSumulaDaPartida } from "@/src/lib/api/sumulas";
import { Partida } from "@/src/lib/types/partida";
import { Sumula } from "@/src/lib/types/sumula";

export const SumulaDetail = () => {
    const params = useParams<{ id: string }>();
    const matchId = Number(params?.id);

    const [partida, setMatch] = useState<Partida | null>(null);
    const [sumula, setSumula] = useState<Sumula | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        if (!Number.isFinite(matchId)) return;

        setCarregando(true);
        Promise.all([buscarPartida(matchId), buscarSumulaDaPartida(matchId)])
            .then(([partida, sumulaDaPartida]) => {
                setMatch(partida);
                setSumula(sumulaDaPartida);
            })
            .catch((causa) =>
                setErro(causa instanceof Error ? causa.message : "Não foi possível carregar a partida."))
            .finally(() => setCarregando(false));
    }, [matchId]);

    if (carregando) {
        return (
            <div className="p-8">
                <div className="bg-card shadow-sm rounded-lg p-4">Carregando partida...</div>
            </div>
        );
    }

    if (!partida) {
        return (
            <div className="p-8">
                <div className="bg-card shadow-sm rounded-lg p-4">
                    {erro ?? "Partida não encontrada."}
                </div>
            </div>
        );
    }

    const scoreDisplay = partida.realizada
        ? `${partida.placarMandante ?? 0} – ${partida.placarVisitante ?? 0}`
        : "vs";

    return (
        <div className="p-8 flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
                <Link href={`/competicao/${partida.nomeCompeticao}`} onClick={(e) => e.preventDefault()}>
                    <button
                        onClick={() => window.history.back()}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Voltar
                    </button>
                </Link>
            </div>

            {/* Header */}
            <div className="bg-card shadow-sm rounded-lg p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {partida.nomeCompeticao} · {partida.fase}
                    </p>
                    <Badge variant={partida.realizada ? "secondary" : "outline"}>
                        {partida.realizada ? "Encerrado" : "Agendado"}
                    </Badge>
                </div>

                {/* Score */}
                <div className="flex items-center justify-center gap-6 py-6">
                    <span className="text-xl font-semibold text-right flex-1">{partida.equipeMandante}</span>
                    <span className="text-4xl font-bold tabular-nums">{scoreDisplay}</span>
                    <span className="text-xl font-semibold text-left flex-1">{partida.equipeVisitante}</span>
                </div>

                {partida.realizada && partida.vencedor && (
                    <p className="text-center text-sm text-muted-foreground">
                        Vencedor: <span className="font-medium text-foreground">{partida.vencedor}</span>
                    </p>
                )}
            </div>

            {/* Sumula */}
            {sumula ? (
                <>
                    {/* Árbitro e status */}
                    <div className="bg-card shadow-sm rounded-lg p-5 flex flex-col gap-3">
                        <h2 className="text-base font-semibold">Dados da Súmula</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Árbitro</p>
                                <p className="font-medium">{sumula.arbitro}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Data de Fechamento</p>
                                <p className="font-medium">{sumula.dataFechamento ?? "—"}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge variant={sumula.assinada ? "secondary" : "outline"}>
                                    {sumula.assinada ? "Assinada" : "Pendente"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Ocorrências */}
                    {sumula.ocorrencias.length > 0 && (
                        <div className="bg-card shadow-sm rounded-lg p-5 flex flex-col gap-3">
                            <h2 className="text-base font-semibold">Ocorrências</h2>
                            <ul className="flex flex-col gap-1.5">
                                {sumula.ocorrencias.map((ocorrencia, i) => (
                                    <li key={i} className="text-sm text-foreground border-l-2 border-border pl-3">
                                        {ocorrencia}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Observações */}
                    {sumula.observacoes && (
                        <div className="bg-card shadow-sm rounded-lg p-5 flex flex-col gap-2">
                            <h2 className="text-base font-semibold">Observações do Árbitro</h2>
                            <p className="text-sm text-foreground">{sumula.observacoes}</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-card shadow-sm rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground">
                    <p className="text-lg font-medium">Súmula não disponível</p>
                    <p className="text-sm">
                        {partida.realizada
                            ? "A súmula desta partida ainda não foi lançada."
                            : "A súmula será preenchida após o encerramento da partida."}
                    </p>
                </div>
            )}
        </div>
    );
};
