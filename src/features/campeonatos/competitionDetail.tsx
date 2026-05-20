"use client"

import { useParams } from "next/navigation";
import { ToggledGrid } from "@/src/components/ToggledGrid";
import { TeamsList } from "@/src/features/campeonatos/teamsList";
import { MatchCalendar } from "@/src/features/campeonatos/matchCalendar";
import { StageInfo } from "@/src/features/campeonatos/stageInfo";
import { EditCompetitionForm } from "@/src/features/campeonatos/editCompetitionForm";
import { mockCompetitions } from "@/src/features/administracoes/mocks/competitions";
import { mockMatches } from "@/src/features/administracoes/mocks/matches";

export const CompetitionDetail = () => {
    const params = useParams<{ id: string }>();
    const competitionId = Number(params?.id);

    const competition = mockCompetitions.find((c) => c.id === competitionId);

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

    return (
        <ToggledGrid
            left={{
                title: competition.name,
                content: <TeamsList teams={competition.teams} />,
            }}
            right={[
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
