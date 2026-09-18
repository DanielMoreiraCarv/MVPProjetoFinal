"use client"

import { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { listarCompeticoes } from "@/src/lib/api/competicoes";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { Competition } from "@/src/lib/types/competition";
import { Match } from "@/src/lib/types/match";

const TorneiosPage = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        listarCompeticoes()
            .then(async (todas) => {
                setCompetitions(todas);
                const porCompeticao = await Promise.all(
                    todas.map((competition) => listarPartidasDaCompeticao(competition.id)),
                );
                setMatches(porCompeticao.flat().filter((match) => !match.finished));
            })
            .catch((causa) =>
                setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os campeonatos."))
            .finally(() => setCarregando(false));
    }, []);

    return (
        <div className="p-8 flex-1 flex flex-col text-black">
            {erro && (
                <div role="alert" className="mb-4 p-4 text-red-600 border border-red-300 rounded-md">
                    {erro}
                </div>
            )}
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4"> Campeonatos </h1>
                    <div className="border border-gray-300 p-4 rounded-md flex-1">
                        <div className="flex flex-col gap-0.75">
                            {carregando && <p>Carregando campeonatos...</p>}
                            {!carregando && competitions.length === 0 && <p>Nenhum campeonato encontrado.</p>}
                            {competitions.map((competition) => (
                                <Card key={competition.id}>
                                    <CardHeader>
                                        <CardTitle>
                                            {competition.name}
                                        </CardTitle>
                                        <CardDescription className="whitespace-pre-wrap">
                                            {competition.description}
                                            {"\n"}
                                            {competition.sport} - {competition.modality}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-span-1 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">Próximos Jogos</h1>
                    <div className="border border-gray-300 p-4 rounded-md flex-1">
                        <div className="flex flex-col gap-0.75">
                            {!carregando && matches.length === 0 && <p>Nenhum jogo agendado.</p>}
                            {matches.map((match) => (
                                <Card key={match.id}>
                                    <CardHeader>
                                        <CardTitle>
                                            {match.homeTeam} vs {match.awayTeam}
                                        </CardTitle>
                                        <CardDescription>
                                            {match.competitionName}
                                        </CardDescription>
                                        <CardDescription>
                                            {match.stageName}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default TorneiosPage;
