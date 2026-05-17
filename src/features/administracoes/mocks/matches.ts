import {Match} from "@/src/features/administracoes/types/match";
import { competitionStageNamesSchema} from "@/src/features/administracoes/types/competitionStage";

export const mockMatches: Match[] = [
    {
        id: 1,
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        date: "2024-08-15 20:00h",
        tournament: "Futebol Masculino",
        competitionName: "La Liga",
        stageName: competitionStageNamesSchema.enum["Pontos Corridos"],
        finished: false,
    },
    {
        id: 2,
        homeTeam: "Manchester City",
        awayTeam: "Liverpool",
        date: "2024-08-16 20:00h",
        tournament: "Futebol Masculino",
        competitionName: "Premier League",
        stageName: competitionStageNamesSchema.enum["Pontos Corridos"],
        finished: false,
    },
    {
        id: 3,
        homeTeam: "Chelsea",
        awayTeam: "Arsenal",
        date: "2024-08-17 20:00h",
        tournament: "Futebol Masculino",
        competitionName: "Copa da Inglaterra",
        stageName: competitionStageNamesSchema.enum.Oitavas,
        finished: false,
    },
];