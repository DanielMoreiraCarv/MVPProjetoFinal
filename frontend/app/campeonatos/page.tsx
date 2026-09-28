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
import { Competicao } from "@/src/lib/types/competicao";
import { Partida } from "@/src/lib/types/partida";

const TorneiosPage = () => {
    const [competitions, setCompetitions] = useState<Competicao[]>([]);
    const [matches, setMatches] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        listarCompeticoes()
            .then(async (todas) => {
                setCompetitions(todas);
                const porCompeticao = await Promise.all(
                    todas.map((competicao) => listarPartidasDaCompeticao(competicao.id)),
                );
                setMatches(porCompeticao.flat().filter((partida) => !partida.realizada));
            })
            .catch((causa) =>
                setErro(causa instanceof Error ? causa.message : "Não foi possível carregar os campeonatos."))
            .finally(() => setCarregando(false));
    }, []);

    return (
        <div className="p-8 flex-1 flex flex-col text-black">
            {erro && (
                <div role="alert" className="mb-4 p-4 text-destructive border border-destructive/40 rounded-md">
                    {erro}
                </div>
            )}
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4"> Campeonatos </h1>
                    <div className="border border-border p-4 rounded-md flex-1">
                        <div className="flex flex-col gap-0.75">
                            {carregando && <p>Carregando campeonatos...</p>}
                            {!carregando && competitions.length === 0 && <p>Nenhum campeonato encontrado.</p>}
                            {competitions.map((competicao) => (
                                <Card key={competicao.id}>
                                    <CardHeader>
                                        <CardTitle>
                                            {competicao.nome}
                                        </CardTitle>
                                        <CardDescription className="whitespace-pre-wrap">
                                            {competicao.descricao}
                                            {"\n"}
                                            {competicao.modalidade} - {competicao.categoria}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-span-1 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">Próximos Jogos</h1>
                    <div className="border border-border p-4 rounded-md flex-1">
                        <div className="flex flex-col gap-0.75">
                            {!carregando && matches.length === 0 && <p>Nenhum jogo agendado.</p>}
                            {matches.map((partida) => (
                                <Card key={partida.id}>
                                    <CardHeader>
                                        <CardTitle>
                                            {partida.equipeMandante} vs {partida.equipeVisitante}
                                        </CardTitle>
                                        <CardDescription>
                                            {partida.nomeCompeticao}
                                        </CardDescription>
                                        <CardDescription>
                                            {partida.fase}
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
