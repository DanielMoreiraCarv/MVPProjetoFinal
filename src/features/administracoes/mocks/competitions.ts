import { Competition, competitionSchema } from "@/src/lib/types/competition";
import { sportSchema } from "@/src/lib/types/sport";


export const mockCompetitions: Competition[] = [
    {
        id: 1,
        name: "Premier League",
        description: "Liga independente dos times da Inglaterra",
        sport: sportSchema.shape.name.enum.Futebol,
        modality: competitionSchema.shape.modality.enum.Masculino,
        teams: []
    },
    {
        id: 2,
        name: "Copa da Inglaterra",
        description: "Copa nacional da Inglaterra, todos os times do país podem participar.",
        sport: sportSchema.shape.name.enum.Futebol,
        modality: competitionSchema.shape.modality.enum.Masculino,
        teams: []
    },
    {
        id: 3,
        name: "La Liga",
        description: "Liga nacional da Espanhã",
        sport: sportSchema.shape.name.enum.Futebol,
        modality: competitionSchema.shape.modality.enum.Masculino,
        teams: []
    }
];


