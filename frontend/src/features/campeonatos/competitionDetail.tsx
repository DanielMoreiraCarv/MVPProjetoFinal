"use client"

import { useState } from "react";
import { useParams } from "next/navigation";
import { ToggledGrid } from "@/src/components/ToggledGrid";
import { TeamsList } from "@/src/features/campeonatos/teamsList";
import { MatchCalendar } from "@/src/features/campeonatos/matchCalendar";
import { StageInfo } from "@/src/features/campeonatos/stageInfo";
import { EditCompetitionForm } from "@/src/features/campeonatos/editCompetitionForm";
import { AddTeamDialog } from "@/src/features/campeonatos/addTeamDialog";
import { StandingsTable, StandingEntry } from "@/src/features/campeonatos/StandingsTable";
import { KnockoutBracket, KnockoutBracketProps, BracketMatchData } from "@/src/features/campeonatos/KnockoutBracket";
import { mockCompetitions } from "@/src/features/administracoes/mocks/competitions";
import { mockMatches } from "@/src/features/administracoes/mocks/matches";
import { Match } from "@/src/lib/types/match";
import { Team } from "@/src/lib/types/team";

const BRACKET_STAGE_ORDER = ["16 de finais", "Oitavas", "Quartas", "Semi-finais"] as const;

function computeStandings(matches: Match[]): StandingEntry[] {
    const stats: Record<string, { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number }> = {};

    for (const match of matches) {
        if (!match.finished) continue;
        const home = match.homeTeam;
        const away = match.awayTeam;
        if (!stats[home]) stats[home] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        if (!stats[away]) stats[away] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        const hg = match.homeScore ?? 0;
        const ag = match.awayScore ?? 0;
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

function toBracketMatch(m: Match): BracketMatchData {
    return { id: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam, homeScore: m.homeScore, awayScore: m.awayScore, winner: m.winner, date: m.date, finished: m.finished };
}

function computeBracket(matches: Match[]): KnockoutBracketProps | null {
    const finalMatch = matches.find(m => m.stageName === "Final");
    if (!finalMatch) return null;

    const topHalf: KnockoutBracketProps["topHalf"] = [];
    const bottomHalf: KnockoutBracketProps["bottomHalf"] = [];

    for (const stageName of BRACKET_STAGE_ORDER) {
        const stageMatches = matches.filter(m => m.stageName === stageName).sort((a, b) => a.id - b.id);
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

    const competition = mockCompetitions.find((c) => c.id === competitionId);

    const [teams, setTeams] = useState<Team[]>(competition?.teams ?? []);

    if (!competition) {
        return (
            <div className="p-8">
                <div className="border border-gray-300 p-4 rounded-md">
                    Competição não encontrada.
                </div>
            </div>
        );
    }

    const competitionMatches = mockMatches.filter(
        (m) => m.competitionName === competition.name
    );

    const isPontosCorridos = competition.currentStage === "Pontos Corridos";
    const standings = isPontosCorridos ? computeStandings(competitionMatches) : [];
    const bracket = !isPontosCorridos ? computeBracket(competitionMatches) : null;

    const handleAddTeam = (team: Team) => {
        setTeams((prev) => [...prev, team]);
    };

    return (
        <ToggledGrid
            left={{
                title: competition.name,
                content: (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-end">
                            <AddTeamDialog onAdd={handleAddTeam} />
                        </div>
                        <TeamsList teams={teams} />
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
                        <p className="text-gray-400 text-sm">Chaveamento não disponível.</p>
                    ),
                },
                {
                    title: "Calendário",
                    content: <MatchCalendar matches={competitionMatches} />,
                },
                {
                    title: "Dados",
                    content: <EditCompetitionForm competition={competition} />,
                },
                {
                    title: "Fase Atual",
                    content: <StageInfo currentStage={competition.currentStage} />,
                },
            ]}
        />
    );
};
