import { Tournaments } from "@/src/lib/types/tournaments";
import { mockCompetitions } from "@/src/features/administracoes/mocks/competitions";

export const mockTournaments: Tournaments[] = [
    {
        id: 1,
        name: "Interclasses Colégio São João",
        description: "Torneio interno anual do Colégio São João com disputas entre turmas.",
        competitions: mockCompetitions.slice(0, 4),  // comps 1–4
    },
    {
        id: 2,
        name: "Copa Casados VS Solteiros do Banco do Nordeste",
        description: "Torneio recreativo dos colaboradores do BNB, edição especial casados x solteiros.",
        competitions: mockCompetitions.slice(4, 6),  // comps 5–6
    },
];
