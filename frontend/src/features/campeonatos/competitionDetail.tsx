"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CarregandoCartoes, Erro } from "@/src/components/estado/Estados";
import { ToggledGrid } from "@/src/components/ToggledGrid";
import { TeamsList } from "@/src/features/campeonatos/teamsList";
import { MatchCalendar } from "@/src/features/campeonatos/matchCalendar";
import { StageInfo } from "@/src/features/campeonatos/stageInfo";
import { EditCompetitionForm } from "@/src/features/campeonatos/editCompetitionForm";
import { AddTeamDialog } from "@/src/features/campeonatos/addTeamDialog";
import { StandingsTable, StandingEntry } from "@/src/features/campeonatos/StandingsTable";
import { KnockoutBracket, KnockoutBracketProps, BracketMatchData } from "@/src/features/campeonatos/KnockoutBracket";
import { buscarCompeticao } from "@/src/lib/api/competicoes";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { Partida } from "@/src/lib/types/partida";
import { Equipe } from "@/src/lib/types/equipe";
import { Competicao } from "@/src/lib/types/competicao";

const BRACKET_STAGE_ORDER = ["16 de finais", "Oitavas", "Quartas", "Semi-finais"] as const;

function computeStandings(matches: Partida[]): StandingEntry[] {
    const stats: Record<string, { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number }> = {};

    for (const partida of matches) {
        if (!partida.realizada) continue;
        const home = partida.equipeMandante;
        const away = partida.equipeVisitante;
        if (!stats[home]) stats[home] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        if (!stats[away]) stats[away] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        const hg = partida.placarMandante ?? 0;
        const ag = partida.placarVisitante ?? 0;
        stats[home].goalsFor += hg;
        stats[home].goalsAgainst += ag;
        stats[away].goalsFor += ag;
        stats[away].goalsAgainst += hg;
        if (hg > ag) { stats[home].wins++; stats[away].losses++; }
        else if (hg < ag) { stats[away].wins++; stats[home].losses++; }
        else { stats[home].draws++; stats[away].draws++; }
    }

    const entries = Object.entries(stats).map(([teamName, s]) => ({
        teamName,
        played: s.wins + s.draws + s.losses,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDiff: s.goalsFor - s.goalsAgainst,
        points: s.wins * 3 + s.draws,
        position: 0,
    }));

    entries.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    return entries.map((e, i) => ({ ...e, position: i + 1 }));
}

function toBracketMatch(m: Partida): BracketMatchData {
    return { id: m.id, homeTeam: m.equipeMandante, awayTeam: m.equipeVisitante, homeScore: m.placarMandante, awayScore: m.placarVisitante, winner: m.vencedor, date: "", finished: m.realizada };
}

function computeBracket(matches: Partida[]): KnockoutBracketProps | null {
    const finalMatch = matches.find(m => m.fase === "Final");
    if (!finalMatch) return null;

    const topHalf: KnockoutBracketProps["topHalf"] = [];
    const bottomHalf: KnockoutBracketProps["bottomHalf"] = [];

    for (const stageName of BRACKET_STAGE_ORDER) {
        const stageMatches = matches.filter(m => m.fase === stageName).sort((a, b) => a.id - b.id);
        if (stageMatches.length === 0) continue;
        const mid = Math.ceil(stageMatches.length / 2);
        topHalf.push({ stageName, matches: stageMatches.slice(0, mid).map(toBracketMatch) });
        bottomHalf.push({ stageName, matches: stageMatches.slice(mid).map(toBracketMatch) });
    }

    return { topHalf, bottomHalf, final: toBracketMatch(finalMatch) };
}

export const CompetitionDetail = () => {
    const params = useParams<{ id: string }>();
    const competitionId = Number(params?.id);

    const [competicao, setCompetition] = useState<Competicao | null>(null);
    const [equipes, setTeams] = useState<Equipe[]>([]);
    const [competitionMatches, setCompetitionMatches] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        if (!Number.isFinite(competitionId)) return;

        setCarregando(true);
        Promise.all([
            buscarCompeticao(competitionId),
            listarPartidasDaCompeticao(competitionId),
        ])
            .then(([encontrada, partidas]) => {
                setCompetition(encontrada);
                setTeams(encontrada.equipes);
                setCompetitionMatches(partidas);
            })
            .catch((causa) =>
                setErro(causa instanceof Error ? causa.message : "Não foi possível carregar a competição."))
            .finally(() => setCarregando(false));
    }, [competitionId]);

    if (carregando) {
        return (
            <CarregandoCartoes cartoes={3} />
        );
    }

    if (!competicao) {
        return <Erro causa={erro ?? "Competição não encontrada."} />;
    }

    const isPontosCorridos = !competicao.isMataMata;
    const standings = isPontosCorridos ? computeStandings(competitionMatches) : [];
    const bracket = !isPontosCorridos ? computeBracket(competitionMatches) : null;

    const handleAddTeam = (equipe: Equipe) => {
        setTeams((prev) => [...prev, equipe]);
    };

    return (
        <ToggledGrid
            left={{
                title: "Equipes",
                content: (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-end">
                            <AddTeamDialog onAdd={handleAddTeam} />
                        </div>
                        <TeamsList equipes={equipes} />
                    </div>
                ),
            }}
            right={[
                {
                    title: "Classificação",
                    content: isPontosCorridos ? (
                        <StandingsTable standings={standings} />
                    ) : bracket ? (
                        <KnockoutBracket {...bracket} />
                    ) : (
                        <p className="text-muted-foreground text-sm">Chaveamento não disponível.</p>
                    ),
                },
                {
                    title: "Calendário",
                    content: <MatchCalendar matches={competitionMatches} />,
                },
                {
                    title: "Dados",
                    content: <EditCompetitionForm competicao={competicao} />,
                },
                {
                    title: "Fase Atual",
                    content: <StageInfo currentStage={competicao.isMataMata ? undefined : "Pontos Corridos"} />,
                },
            ]}
        />
    );
};
