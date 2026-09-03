import { Match } from "@/src/lib/types/match";
import { competitionStageNamesSchema } from "@/src/lib/types/competitionStage";

const s = competitionStageNamesSchema.enum;

// ══════════════════════════════════════════════════════════════════
// COMP 1 — Futebol Fundamental II Masculino  (IDs 1–15)
// Torneio: Interclasses Colégio São João | Formato: Mata-Mata
// Oitavas: 1–8 (todas encerradas)
// Quartas: 9–12 (9,10 encerradas; 11,12 agendadas)
// Semi-finais: 13–14 (agendadas)
// Final: 15 (agendada)
// ══════════════════════════════════════════════════════════════════

const comp1Matches: Match[] = [
    { id: 1,  homeTeam: "Panteras Negras",       homeScore: 2, awayScore: 1, awayTeam: "Trovões Azuis",          winner: "Panteras Negras",    date: "2026-02-07 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 2,  homeTeam: "Leões do Norte",         homeScore: 3, awayScore: 0, awayTeam: "Tubarões Furiosos",      winner: "Leões do Norte",      date: "2026-02-07 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 3,  homeTeam: "Falcões Dourados",       homeScore: 1, awayScore: 2, awayTeam: "Dragões de Ferro",       winner: "Dragões de Ferro",    date: "2026-02-07 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 4,  homeTeam: "Lobos da Noite",         homeScore: 1, awayScore: 0, awayTeam: "Cobras Venenosas",       winner: "Lobos da Noite",      date: "2026-02-07 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 5,  homeTeam: "Águias Plateadas",       homeScore: 3, awayScore: 1, awayTeam: "Rinocerontes Brancos",   winner: "Águias Plateadas",    date: "2026-02-14 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 6,  homeTeam: "Tigres da Serra",        homeScore: 2, awayScore: 0, awayTeam: "Ursos Polares",          winner: "Tigres da Serra",     date: "2026-02-14 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 7,  homeTeam: "Javalis Selvagens",      homeScore: 0, awayScore: 1, awayTeam: "Gaviões do Colégio",    winner: "Gaviões do Colégio",  date: "2026-02-14 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 8,  homeTeam: "Piratas do Fundamental", homeScore: 2, awayScore: 3, awayTeam: "Guerreiros da Quadra",  winner: "Guerreiros da Quadra",date: "2026-02-14 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Oitavas, finished: true },
    { id: 9,  homeTeam: "Panteras Negras",        homeScore: 1, awayScore: 0, awayTeam: "Leões do Norte",        winner: "Panteras Negras",     date: "2026-02-28 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Quartas, finished: true },
    { id: 10, homeTeam: "Dragões de Ferro",       homeScore: 2, awayScore: 1, awayTeam: "Lobos da Noite",        winner: "Dragões de Ferro",    date: "2026-02-28 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Quartas, finished: true },
    { id: 11, homeTeam: "Águias Plateadas",       awayTeam: "Tigres da Serra",                                                                  date: "2026-05-30 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Quartas, finished: false },
    { id: 12, homeTeam: "Gaviões do Colégio",    awayTeam: "Guerreiros da Quadra",                                                             date: "2026-05-30 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Quartas, finished: false },
    { id: 13, homeTeam: "Panteras Negras",        awayTeam: "Dragões de Ferro",                                                                  date: "2026-06-13 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s["Semi-finais"], finished: false },
    { id: 14, homeTeam: "Vencedor Partida 11",    awayTeam: "Vencedor Partida 12",                                                              date: "2026-06-13 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s["Semi-finais"], finished: false },
    { id: 15, homeTeam: "Vencedor Partida 13",    awayTeam: "Vencedor Partida 14",                                                              date: "2026-06-27 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Masculino", stageName: s.Final, finished: false },
];

// ══════════════════════════════════════════════════════════════════
// COMP 2 — Futebol Ensino Médio Masculino  (IDs 16–30)
// Oitavas: 16–23 (16–20 encerradas; 21–23 agendadas)
// Quartas: 24–27 (agendadas)
// Semi-finais: 28–29 (agendadas)
// Final: 30 (agendada)
// ══════════════════════════════════════════════════════════════════

const comp2Matches: Match[] = [
    { id: 16, homeTeam: "Gladiadores do EM",      homeScore: 2, awayScore: 0, awayTeam: "Titãs da Primeira",      winner: "Gladiadores do EM",   date: "2026-02-07 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: true },
    { id: 17, homeTeam: "Spartanos da Segunda",   homeScore: 1, awayScore: 0, awayTeam: "Centuriões da Terceira", winner: "Spartanos da Segunda", date: "2026-02-07 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: true },
    { id: 18, homeTeam: "Vikingues Dourados",     homeScore: 3, awayScore: 2, awayTeam: "Samurais do Colégio",    winner: "Vikingues Dourados",   date: "2026-02-14 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: true },
    { id: 19, homeTeam: "Ninjas da Tarde",        homeScore: 0, awayScore: 1, awayTeam: "Guerreiros do Norte",   winner: "Guerreiros do Norte",  date: "2026-02-14 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: true },
    { id: 20, homeTeam: "Cavaleiros Negros",      homeScore: 2, awayScore: 1, awayTeam: "Escudeiros da Lua",     winner: "Cavaleiros Negros",    date: "2026-02-21 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: true },
    { id: 21, homeTeam: "Templários da Escola",   awayTeam: "Cruzados do Sul",                                                                   date: "2026-05-30 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: false },
    { id: 22, homeTeam: "Espartanos da Tarde",    awayTeam: "Romanos da Segunda",                                                                date: "2026-05-30 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: false },
    { id: 23, homeTeam: "Nórdicos do EM",         awayTeam: "Maias da Escola",                                                                   date: "2026-05-30 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Oitavas, finished: false },
    { id: 24, homeTeam: "Gladiadores do EM",      awayTeam: "Spartanos da Segunda",                                                              date: "2026-06-13 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Quartas, finished: false },
    { id: 25, homeTeam: "Vikingues Dourados",     awayTeam: "Guerreiros do Norte",                                                               date: "2026-06-13 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Quartas, finished: false },
    { id: 26, homeTeam: "Cavaleiros Negros",      awayTeam: "Vencedor Partida 21",                                                               date: "2026-06-13 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Quartas, finished: false },
    { id: 27, homeTeam: "Vencedor Partida 22",    awayTeam: "Vencedor Partida 23",                                                               date: "2026-06-13 16:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Quartas, finished: false },
    { id: 28, homeTeam: "Vencedor Partida 24",    awayTeam: "Vencedor Partida 25",                                                               date: "2026-06-27 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s["Semi-finais"], finished: false },
    { id: 29, homeTeam: "Vencedor Partida 26",    awayTeam: "Vencedor Partida 27",                                                               date: "2026-06-27 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s["Semi-finais"], finished: false },
    { id: 30, homeTeam: "Vencedor Partida 28",    awayTeam: "Vencedor Partida 29",                                                               date: "2026-07-11 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Masculino", stageName: s.Final, finished: false },
];

// ══════════════════════════════════════════════════════════════════
// COMP 3 — Futebol Fundamental II Feminino  (IDs 31–45)
// Oitavas: 31–38 (31–36 encerradas; 37–38 agendadas)
// Quartas: 39–42 (39–40 encerradas; 41–42 agendadas)
// Semi-finais: 43–44 (43 agendada com times conhecidos; 44 agendada)
// Final: 45 (agendada)
// ══════════════════════════════════════════════════════════════════

const comp3Matches: Match[] = [
    { id: 31, homeTeam: "Flamingos Rosas",       homeScore: 2, awayScore: 0, awayTeam: "Borboletas Douradas",    winner: "Flamingos Rosas",     date: "2026-02-07 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: true },
    { id: 32, homeTeam: "Onças Pintadas",        homeScore: 1, awayScore: 0, awayTeam: "Pumas da Tarde",         winner: "Onças Pintadas",      date: "2026-02-07 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: true },
    { id: 33, homeTeam: "Garotas de Fogo",       homeScore: 3, awayScore: 1, awayTeam: "Estrelas da Quadra",    winner: "Garotas de Fogo",     date: "2026-02-07 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: true },
    { id: 34, homeTeam: "Princesas do Gol",      homeScore: 2, awayScore: 1, awayTeam: "Rainhas do Campo",      winner: "Princesas do Gol",    date: "2026-02-07 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: true },
    { id: 35, homeTeam: "Feras da Sétima",       homeScore: 0, awayScore: 2, awayTeam: "Panteras Rosadas",      winner: "Panteras Rosadas",    date: "2026-02-14 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: true },
    { id: 36, homeTeam: "Leonas Bravias",        homeScore: 1, awayScore: 0, awayTeam: "Tigresas do Norte",     winner: "Leonas Bravias",      date: "2026-02-14 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: true },
    { id: 37, homeTeam: "Sereias do Gol",        awayTeam: "Guerreiras da Quadra",                                                              date: "2026-05-30 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: false },
    { id: 38, homeTeam: "Lobas da Floresta",     awayTeam: "Fênix do Colégio",                                                                  date: "2026-05-30 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Oitavas, finished: false },
    { id: 39, homeTeam: "Flamingos Rosas",       homeScore: 1, awayScore: 0, awayTeam: "Onças Pintadas",        winner: "Flamingos Rosas",     date: "2026-03-07 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Quartas, finished: true },
    { id: 40, homeTeam: "Garotas de Fogo",       homeScore: 2, awayScore: 1, awayTeam: "Princesas do Gol",     winner: "Garotas de Fogo",     date: "2026-03-07 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Quartas, finished: true },
    { id: 41, homeTeam: "Panteras Rosadas",      awayTeam: "Leonas Bravias",                                                                    date: "2026-05-30 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Quartas, finished: false },
    { id: 42, homeTeam: "Vencedor Partida 37",   awayTeam: "Vencedor Partida 38",                                                               date: "2026-05-30 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Quartas, finished: false },
    { id: 43, homeTeam: "Flamingos Rosas",       awayTeam: "Garotas de Fogo",                                                                   date: "2026-06-13 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s["Semi-finais"], finished: false },
    { id: 44, homeTeam: "Vencedor Partida 41",   awayTeam: "Vencedor Partida 42",                                                               date: "2026-06-13 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s["Semi-finais"], finished: false },
    { id: 45, homeTeam: "Vencedor Partida 43",   awayTeam: "Vencedor Partida 44",                                                               date: "2026-06-27 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Fundamental II - Feminino", stageName: s.Final, finished: false },
];

// ══════════════════════════════════════════════════════════════════
// COMP 4 — Futebol Ensino Médio Feminino  (IDs 46–60)
// Campeonato mais avançado — Semi-finais
// Oitavas: 46–53 (todas encerradas)
// Quartas: 54–57 (todas encerradas)
// Semi-finais: 58–59 (58 encerrada; 59 agendada)
// Final: 60 (agendada)
// ══════════════════════════════════════════════════════════════════

const comp4Matches: Match[] = [
    { id: 46, homeTeam: "Deusas do Olimpo",       homeScore: 3, awayScore: 0, awayTeam: "Amazonas Douradas",     winner: "Deusas do Olimpo",    date: "2026-02-07 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 47, homeTeam: "Valquírias da Escola",   homeScore: 2, awayScore: 1, awayTeam: "Fadas da Bola",         winner: "Valquírias da Escola",date: "2026-02-07 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 48, homeTeam: "Musas do Gol",           homeScore: 1, awayScore: 0, awayTeam: "Lendas do Ensino Médio",winner: "Musas do Gol",        date: "2026-02-07 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 49, homeTeam: "Harpias Prateadas",      homeScore: 2, awayScore: 0, awayTeam: "Atletas de Ouro",       winner: "Harpias Prateadas",   date: "2026-02-07 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 50, homeTeam: "Gladiadoras da Tarde",   homeScore: 0, awayScore: 1, awayTeam: "Esfinges da Escola",    winner: "Esfinges da Escola",  date: "2026-02-14 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 51, homeTeam: "Ninfas do Campo",        homeScore: 3, awayScore: 2, awayTeam: "Titãs da Terceira",     winner: "Ninfas do Campo",     date: "2026-02-14 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 52, homeTeam: "Arianas do Colégio",     homeScore: 2, awayScore: 1, awayTeam: "Dominantes da Segunda", winner: "Arianas do Colégio",  date: "2026-02-14 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 53, homeTeam: "Estrelas da Primeira",   homeScore: 1, awayScore: 0, awayTeam: "Campeãs do Sul",        winner: "Estrelas da Primeira",date: "2026-02-14 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Oitavas, finished: true },
    { id: 54, homeTeam: "Deusas do Olimpo",       homeScore: 2, awayScore: 0, awayTeam: "Valquírias da Escola",  winner: "Deusas do Olimpo",    date: "2026-02-28 09:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Quartas, finished: true },
    { id: 55, homeTeam: "Musas do Gol",           homeScore: 1, awayScore: 2, awayTeam: "Harpias Prateadas",     winner: "Harpias Prateadas",   date: "2026-02-28 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Quartas, finished: true },
    { id: 56, homeTeam: "Esfinges da Escola",     homeScore: 3, awayScore: 1, awayTeam: "Ninfas do Campo",       winner: "Esfinges da Escola",  date: "2026-02-28 11:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Quartas, finished: true },
    { id: 57, homeTeam: "Arianas do Colégio",     homeScore: 0, awayScore: 1, awayTeam: "Estrelas da Primeira",  winner: "Estrelas da Primeira",date: "2026-02-28 14:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Quartas, finished: true },
    { id: 58, homeTeam: "Deusas do Olimpo",       homeScore: 2, awayScore: 1, awayTeam: "Harpias Prateadas",     winner: "Deusas do Olimpo",    date: "2026-03-14 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s["Semi-finais"], finished: true },
    { id: 59, homeTeam: "Esfinges da Escola",     awayTeam: "Estrelas da Primeira",                                                              date: "2026-05-30 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s["Semi-finais"], finished: false },
    { id: 60, homeTeam: "Deusas do Olimpo",       awayTeam: "Vencedor Partida 59",                                                               date: "2026-06-13 10:00h", tournament: "Interclasses Colégio São João", competitionName: "Futebol Ensino Médio - Feminino", stageName: s.Final, finished: false },
];

// ══════════════════════════════════════════════════════════════════
// COMP 5 — Futebol Sênior 50+ Masculino  (IDs 61–76)
// Torneio: Copa Casados VS Solteiros do Banco do Nordeste
// Formato: Pontos Corridos — 2 rodadas de 8 partidas
// Rodada 1: 61–68 (todas encerradas)
// Rodada 2: 69–76 (69–72 encerradas; 73–76 agendadas)
// ══════════════════════════════════════════════════════════════════

const comp5Matches: Match[] = [
    { id: 61, homeTeam: "Veteranos de Ferro",          homeScore: 2, awayScore: 0, awayTeam: "Legends do BNB",              winner: "Veteranos de Ferro",         date: "2026-02-07 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 62, homeTeam: "Seniores Dourados",           homeScore: 1, awayScore: 1, awayTeam: "Mestres da Bola",             date: "2026-02-07 09:00h",             tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 63, homeTeam: "Galera dos 50+",              homeScore: 3, awayScore: 2, awayTeam: "Patrimônio Vivo",             winner: "Galera dos 50+",             date: "2026-02-07 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 64, homeTeam: "Pensão do Gol",               homeScore: 0, awayScore: 1, awayTeam: "Capitães da Aposentadoria",  winner: "Capitães da Aposentadoria",  date: "2026-02-07 11:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 65, homeTeam: "Craques da Gerência",         homeScore: 2, awayScore: 2, awayTeam: "Dinossauros do Norte",        date: "2026-02-07 14:00h",             tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 66, homeTeam: "Clássicos da Empresa",        homeScore: 1, awayScore: 0, awayTeam: "Troféus do Banco",            winner: "Clássicos da Empresa",       date: "2026-02-07 15:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 67, homeTeam: "Sábios da Quadra",            homeScore: 3, awayScore: 1, awayTeam: "Lendas do Seridó",            winner: "Sábios da Quadra",           date: "2026-02-07 16:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 68, homeTeam: "Veteranos do Nordeste",       homeScore: 2, awayScore: 1, awayTeam: "Grisalhos do BNB",            winner: "Veteranos do Nordeste",      date: "2026-02-07 17:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 69, homeTeam: "Legends do BNB",              homeScore: 1, awayScore: 2, awayTeam: "Galera dos 50+",              winner: "Galera dos 50+",             date: "2026-02-28 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 70, homeTeam: "Mestres da Bola",             homeScore: 0, awayScore: 1, awayTeam: "Sábios da Quadra",            winner: "Sábios da Quadra",           date: "2026-02-28 09:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 71, homeTeam: "Patrimônio Vivo",             homeScore: 2, awayScore: 0, awayTeam: "Grisalhos do BNB",            winner: "Patrimônio Vivo",            date: "2026-02-28 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 72, homeTeam: "Capitães da Aposentadoria",   homeScore: 1, awayScore: 1, awayTeam: "Clássicos da Empresa",       date: "2026-02-28 11:00h",             tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: true },
    { id: 73, homeTeam: "Dinossauros do Norte",        awayTeam: "Veteranos de Ferro",                                                                              date: "2026-05-30 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: false },
    { id: 74, homeTeam: "Troféus do Banco",            awayTeam: "Veteranos do Nordeste",                                                                           date: "2026-05-30 09:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: false },
    { id: 75, homeTeam: "Seniores Dourados",           awayTeam: "Pensão do Gol",                                                                                   date: "2026-05-30 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: false },
    { id: 76, homeTeam: "Craques da Gerência",         awayTeam: "Lendas do Seridó",                                                                                date: "2026-05-30 11:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Sênior 50+ - Masculino", stageName: s["Pontos Corridos"], finished: false },
];

// ══════════════════════════════════════════════════════════════════
// COMP 6 — Futebol Masculino  (IDs 77–91)
// Torneio: Copa Casados VS Solteiros | Formato: Mata-Mata
// Oitavas: 77–84 (todas encerradas)
// Quartas: 85–88 (85–86 encerradas; 87–88 agendadas)
// Semi-finais: 89–90 (agendadas)
// Final: 91 (agendada)
// ══════════════════════════════════════════════════════════════════

const comp6Matches: Match[] = [
    { id: 77, homeTeam: "Casados Bravos",         homeScore: 3, awayScore: 1, awayTeam: "Solteiros Unidos",      winner: "Casados Bravos",       date: "2026-02-07 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 78, homeTeam: "Aliança do Gol",         homeScore: 2, awayScore: 0, awayTeam: "Coroa & Chuteira",      winner: "Aliança do Gol",       date: "2026-02-07 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 79, homeTeam: "Ring e Rede FC",         homeScore: 1, awayScore: 2, awayTeam: "Célibatários do BNB",   winner: "Célibatários do BNB",  date: "2026-02-07 12:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 80, homeTeam: "Esposa Mandou Jogar",    homeScore: 3, awayScore: 2, awayTeam: "Solteirões Raivosos",   winner: "Esposa Mandou Jogar",  date: "2026-02-07 14:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 81, homeTeam: "Maridos de Ouro",        homeScore: 1, awayScore: 0, awayTeam: "Noivados Furiosos",     winner: "Maridos de Ouro",      date: "2026-02-14 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 82, homeTeam: "Chuteiras Livres",       homeScore: 2, awayScore: 1, awayTeam: "Bola e Aliança FC",     winner: "Chuteiras Livres",     date: "2026-02-14 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 83, homeTeam: "Prometidos FC",          homeScore: 0, awayScore: 1, awayTeam: "BNB Unleashed",         winner: "BNB Unleashed",        date: "2026-02-14 12:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 84, homeTeam: "Os Solteirões",          homeScore: 2, awayScore: 0, awayTeam: "Aliança Dourada",       winner: "Os Solteirões",        date: "2026-02-14 14:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Oitavas, finished: true },
    { id: 85, homeTeam: "Casados Bravos",         homeScore: 2, awayScore: 1, awayTeam: "Aliança do Gol",        winner: "Casados Bravos",       date: "2026-02-28 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Quartas, finished: true },
    { id: 86, homeTeam: "Célibatários do BNB",   homeScore: 1, awayScore: 0, awayTeam: "Esposa Mandou Jogar",   winner: "Célibatários do BNB",  date: "2026-02-28 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Quartas, finished: true },
    { id: 87, homeTeam: "Maridos de Ouro",        awayTeam: "Chuteiras Livres",                                                                   date: "2026-05-30 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Quartas, finished: false },
    { id: 88, homeTeam: "BNB Unleashed",          awayTeam: "Os Solteirões",                                                                       date: "2026-05-30 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Quartas, finished: false },
    { id: 89, homeTeam: "Casados Bravos",         awayTeam: "Célibatários do BNB",                                                                 date: "2026-06-13 08:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s["Semi-finais"], finished: false },
    { id: 90, homeTeam: "Vencedor Partida 87",    awayTeam: "Vencedor Partida 88",                                                                  date: "2026-06-13 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s["Semi-finais"], finished: false },
    { id: 91, homeTeam: "Vencedor Partida 89",    awayTeam: "Vencedor Partida 90",                                                                  date: "2026-06-27 10:00h", tournament: "Copa Casados VS Solteiros do Banco do Nordeste", competitionName: "Futebol Masculino", stageName: s.Final, finished: false },
];

export const mockMatches: Match[] = [
    ...comp1Matches,
    ...comp2Matches,
    ...comp3Matches,
    ...comp4Matches,
    ...comp5Matches,
    ...comp6Matches,
];
