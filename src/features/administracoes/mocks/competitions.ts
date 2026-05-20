import { Competition, competitionSchema } from "@/src/lib/types/competition";
import { sportSchema } from "@/src/lib/types/sport";
import { competitionStageNamesSchema } from "@/src/lib/types/competitionStage";
import { mockTeams } from "@/src/features/administracoes/mocks/teams";

export const mockCompetitions: Competition[] = [
    {
        id: 1,
        name: "Premier League",
        description: "Liga independente dos times da Inglaterra",
        sport: sportSchema.shape.name.enum.Futebol,
        modality: competitionSchema.shape.modality.enum.Masculino,
        teams: mockTeams.slice(0, 4),
        currentStage: competitionStageNamesSchema.enum["Pontos Corridos"],
    },
    {
        id: 2,
        name: "Copa da Inglaterra",
        description: "Copa nacional da Inglaterra, todos os times do país podem participar.",
        sport: sportSchema.shape.name.enum.Futebol,
        modality: competitionSchema.shape.modality.enum.Masculino,
        teams: mockTeams.slice(0, 4),
        currentStage: competitionStageNamesSchema.enum.Oitavas,
    },
    {
        id: 3,
        name: "La Liga",
        description: "Liga nacional da Espanha",
        sport: sportSchema.shape.name.enum.Futebol,
        modality: competitionSchema.shape.modality.enum.Masculino,
        teams: mockTeams.slice(4, 7),
        currentStage: competitionStageNamesSchema.enum["Pontos Corridos"],
    },
];
