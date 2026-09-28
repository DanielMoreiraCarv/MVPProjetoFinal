// Formas dos arquivos desta pasta, declaradas aqui.
//
// Os cinco arquivos ao lado vinham de `frontend/src/lib/types/`, em inglês.
// Quando o front passou ao vocabulário do glossário, esses tipos deixaram de
// existir lá — e manter uma segunda cópia em inglês dentro do front só para
// eles seria carregar dois vocabulários no mesmo projeto.
//
// Nada aqui é compilado por ninguém: quem lê esta pasta é
// `gerar_dados_de_teste.py`, por expressão regular. As anotações existem para
// o arquivo continuar legível e para as regex do gerador continuarem achando
// `const tN: Team = {`. Não converta esta pasta para PT-BR: o gerador procura
// os identificadores em inglês.

export type SportName = string;

export interface Sport {
    id: number;
    name: string;
    description: string;
}

export interface Player {
    id: number;
    name: string;
    number?: number;
    age?: number;
    suspended: boolean;
}

export interface Team {
    id: number;
    name: string;
    players: Player[];
    sport: Sport;
}

export type CompetitionStageNames =
    | "Pontos Corridos"
    | "Grupo"
    | "16 de finais"
    | "Oitavas"
    | "Quartas"
    | "Semi-finais"
    | "Final";

export const competitionStageNamesSchema = {
    enum: {
        "Pontos Corridos": "Pontos Corridos",
        Grupo: "Grupo",
        "16 de finais": "16 de finais",
        Oitavas: "Oitavas",
        Quartas: "Quartas",
        "Semi-finais": "Semi-finais",
        Final: "Final",
    },
} as const;

export interface Competition {
    id: number;
    name: string;
    description: string;
    sport: string;
    modalidadeId?: number;
    modality: string;
    administracaoId?: number;
    teams: Team[];
    currentStage?: CompetitionStageNames;
}

export interface Tournaments {
    id: number;
    name: string;
    description: string;
    competitions: Competition[];
}

export interface Match {
    id: number;
    homeTeam: string;
    homeScore?: number;
    awayTeam: string;
    awayScore?: number;
    winner?: string;
    date: string;
    tournament: string;
    competitionName: string;
    stageName: CompetitionStageNames;
    finished: boolean;
}

export interface Sumula {
    id: number;
    matchId: number;
    arbitro: string;
    golsMandante: number;
    golsVisitante: number;
    ocorrencias: string[];
    observacoesRelatadas: string;
    dataFechamento?: string;
    assinada: boolean;
}
