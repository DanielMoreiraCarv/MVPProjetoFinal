import { Competition } from "@/src/lib/types/competition";
import { sportSchema } from "@/src/lib/types/sport";
import { competitionStageNamesSchema } from "@/src/lib/types/competitionStage";
import { mockTeams } from "@/src/features/administracoes/mocks/teams";

const football = sportSchema.shape.name.enum.Futebol;

export const mockCompetitions: Competition[] = [
    // ── Interclasses Colégio São João ──────────────────────────────────
    {
        id: 1,
        name: "Futebol Fundamental II - Masculino",
        description: "Campeonato interclasses do Fundamental II masculino do Colégio São João.",
        sport: football,
        modality: "Masculino",
        teams: mockTeams.slice(0, 16),   // times 1–16
        currentStage: competitionStageNamesSchema.enum.Quartas,
    },
    {
        id: 2,
        name: "Futebol Ensino Médio - Masculino",
        description: "Campeonato interclasses do Ensino Médio masculino do Colégio São João.",
        sport: football,
        modality: "Masculino",
        teams: mockTeams.slice(16, 32),  // times 17–32
        currentStage: competitionStageNamesSchema.enum.Oitavas,
    },
    {
        id: 3,
        name: "Futebol Fundamental II - Feminino",
        description: "Campeonato interclasses do Fundamental II feminino do Colégio São João.",
        sport: football,
        modality: "Feminino",
        teams: mockTeams.slice(32, 48),  // times 33–48
        currentStage: competitionStageNamesSchema.enum.Quartas,
    },
    {
        id: 4,
        name: "Futebol Ensino Médio - Feminino",
        description: "Campeonato interclasses do Ensino Médio feminino do Colégio São João.",
        sport: football,
        modality: "Feminino",
        teams: mockTeams.slice(48, 64),  // times 49–64
        currentStage: competitionStageNamesSchema.enum["Semi-finais"],
    },
    // ── Copa Casados VS Solteiros do Banco do Nordeste ─────────────────
    {
        id: 5,
        name: "Futebol Sênior 50+ - Masculino",
        description: "Campeonato de pontos corridos para atletas veteranos acima de 50 anos.",
        sport: football,
        modality: "Masculino",
        teams: mockTeams.slice(64, 80),  // times 65–80
        currentStage: competitionStageNamesSchema.enum["Pontos Corridos"],
    },
    {
        id: 6,
        name: "Futebol Masculino",
        description: "Copa mata-mata aberta para todos os colaboradores do Banco do Nordeste.",
        sport: football,
        modality: "Masculino",
        teams: mockTeams.slice(80, 96),  // times 81–96
        currentStage: competitionStageNamesSchema.enum.Quartas,
    },
];
