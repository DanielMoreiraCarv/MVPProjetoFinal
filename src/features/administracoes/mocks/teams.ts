import { Team } from "@/src/lib/types/team";

const football = {
    id: 1,
    name: "Futebol" as const,
    description: "Futebol associação",
};

export const mockTeams: Team[] = [
    // English teams — competitions 1 (Premier League) and 2 (Copa da Inglaterra)
    {
        id: 1,
        name: "Manchester City",
        sport: football,
        players: [
            { id: "p1", name: "Ederson", suspended: false },
            { id: "p2", name: "Rúben Dias", suspended: false },
            { id: "p3", name: "Kevin De Bruyne", suspended: false },
            { id: "p4", name: "Erling Haaland", suspended: false },
            { id: "p5", name: "Phil Foden", suspended: false },
        ],
    },
    {
        id: 2,
        name: "Liverpool",
        sport: football,
        players: [
            { id: "p6", name: "Alisson", suspended: false },
            { id: "p7", name: "Virgil van Dijk", suspended: false },
            { id: "p8", name: "Mohamed Salah", suspended: false },
            { id: "p9", name: "Darwin Núñez", suspended: false },
            { id: "p10", name: "Trent Alexander-Arnold", suspended: false },
        ],
    },
    {
        id: 3,
        name: "Arsenal",
        sport: football,
        players: [
            { id: "p11", name: "David Raya", suspended: false },
            { id: "p12", name: "William Saliba", suspended: false },
            { id: "p13", name: "Martin Ødegaard", suspended: false },
            { id: "p14", name: "Bukayo Saka", suspended: false },
            { id: "p15", name: "Gabriel Martinelli", suspended: false },
        ],
    },
    {
        id: 4,
        name: "Chelsea",
        sport: football,
        players: [
            { id: "p16", name: "Robert Sánchez", suspended: false },
            { id: "p17", name: "Thiago Silva", suspended: false },
            { id: "p18", name: "Cole Palmer", suspended: false },
            { id: "p19", name: "Nicolas Jackson", suspended: false },
            { id: "p20", name: "Raheem Sterling", suspended: false },
        ],
    },
    // Spanish teams — competition 3 (La Liga)
    {
        id: 5,
        name: "Real Madrid",
        sport: football,
        players: [
            { id: "p21", name: "Thibaut Courtois", suspended: false },
            { id: "p22", name: "Éder Militão", suspended: false },
            { id: "p23", name: "Luka Modric", suspended: false },
            { id: "p24", name: "Jude Bellingham", suspended: false },
            { id: "p25", name: "Vinicius Jr", suspended: false },
        ],
    },
    {
        id: 6,
        name: "Barcelona",
        sport: football,
        players: [
            { id: "p26", name: "Marc-André ter Stegen", suspended: false },
            { id: "p27", name: "Ronald Araújo", suspended: false },
            { id: "p28", name: "Pedri", suspended: false },
            { id: "p29", name: "Robert Lewandowski", suspended: false },
            { id: "p30", name: "Raphinha", suspended: false },
        ],
    },
    {
        id: 7,
        name: "Atlético de Madrid",
        sport: football,
        players: [
            { id: "p31", name: "Jan Oblak", suspended: false },
            { id: "p32", name: "José María Giménez", suspended: false },
            { id: "p33", name: "Koke", suspended: false },
            { id: "p34", name: "Antoine Griezmann", suspended: false },
            { id: "p35", name: "Álvaro Morata", suspended: false },
        ],
    },
];
