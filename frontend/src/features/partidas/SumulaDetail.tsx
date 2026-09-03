"use client"

import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mockMatches } from "@/src/features/administracoes/mocks/matches";
import { mockSumulas } from "@/src/features/administracoes/mocks/sumulas";

export const SumulaDetail = () => {
    const params = useParams<{ matchId: string }>();
    const matchId = Number(params?.matchId);

    const match = mockMatches.find((m) => m.id === matchId);

    if (!match) {
        return (
            <div className="p-8">
                <div className="bg-white shadow-sm rounded-lg p-4">
                    Partida não encontrada.
                </div>
            </div>
        );
    }

    const sumula = mockSumulas.find((s) => s.matchId === matchId);

    const scoreDisplay = match.finished
        ? `${match.homeScore ?? 0} – ${match.awayScore ?? 0}`
        : "vs";

    return (
        <div className="p-8 flex flex-col gap-6 text-black max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
                <Link href={`/campeonatos/${match.competitionName}`} onClick={(e) => e.preventDefault()}>
                    <button
                        onClick={() => window.history.back()}
                        className="text-sm text-gray-500 hover:text-black transition-colors"
                    >
                        ← Voltar
                    </button>
                </Link>
            </div>

            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {match.tournament} · {match.competitionName} · {match.stageName}
                    </p>
                    <Badge variant={match.finished ? "secondary" : "outline"}>
                        {match.finished ? "Encerrado" : "Agendado"}
                    </Badge>
                </div>
                <p className="text-sm text-gray-400">{match.date}</p>

                {/* Score */}
                <div className="flex items-center justify-center gap-6 py-6">
                    <span className="text-xl font-semibold text-right flex-1">{match.homeTeam}</span>
                    <span className="text-4xl font-bold tabular-nums">{scoreDisplay}</span>
                    <span className="text-xl font-semibold text-left flex-1">{match.awayTeam}</span>
                </div>

                {match.finished && match.winner && (
                    <p className="text-center text-sm text-gray-500">
                        Vencedor: <span className="font-medium text-black">{match.winner}</span>
                    </p>
                )}
            </div>

            {/* Sumula */}
            {sumula ? (
                <>
                    {/* Árbitro e status */}
                    <div className="bg-white shadow-sm rounded-lg p-5 flex flex-col gap-3">
                        <h2 className="text-base font-semibold">Dados da Súmula</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Árbitro</p>
                                <p className="font-medium">{sumula.arbitro}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Data de Fechamento</p>
                                <p className="font-medium">{sumula.dataFechamento ?? "—"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Status</p>
                                <Badge variant={sumula.assinada ? "secondary" : "outline"}>
                                    {sumula.assinada ? "Assinada" : "Pendente"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Ocorrências */}
                    {sumula.ocorrencias.length > 0 && (
                        <div className="bg-white shadow-sm rounded-lg p-5 flex flex-col gap-3">
                            <h2 className="text-base font-semibold">Ocorrências</h2>
                            <ul className="flex flex-col gap-1.5">
                                {sumula.ocorrencias.map((ocorrencia, i) => (
                                    <li key={i} className="text-sm text-gray-700 border-l-2 border-gray-200 pl-3">
                                        {ocorrencia}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Observações */}
                    {sumula.observacoesRelatadas && (
                        <div className="bg-white shadow-sm rounded-lg p-5 flex flex-col gap-2">
                            <h2 className="text-base font-semibold">Observações do Árbitro</h2>
                            <p className="text-sm text-gray-700">{sumula.observacoesRelatadas}</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center gap-2 text-gray-400">
                    <p className="text-lg font-medium">Súmula não disponível</p>
                    <p className="text-sm">
                        {match.finished
                            ? "A súmula desta partida ainda não foi lançada."
                            : "A súmula será preenchida após o encerramento da partida."}
                    </p>
                </div>
            )}
        </div>
    );
};
