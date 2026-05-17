import {Tournaments} from "@/src/lib/types/tournaments";
import {mockCompetitions} from "@/src/features/administracoes/mocks/competitions";

export const mockTournaments: Tournaments[] = [
    {
        id: 1,
        name: "Futebol Inglês",
        description: "Campeonatos de futebol inglês.",
        competitions: mockCompetitions.slice(0, 2)
    },
    {
        id: 2,
        name: "Futebol Espanhol",
        description: "Campeonatos de futebol espanhol.",
        competitions: mockCompetitions.slice(2, 3)
    }
]