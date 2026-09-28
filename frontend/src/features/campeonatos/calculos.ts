import { StandingEntry } from "@/src/features/campeonatos/StandingsTable";
import { Partida } from "@/src/lib/types/partida";

/**
 * Classificação calculada no cliente.
 *
 * Isto é provisório e está registrado como tal: por RNF23 o cálculo precisa
 * viver só no servidor, derivado dos eventos da partida, e o front só exibir.
 * O backend já tem o motor de fases; falta a rota. Enquanto ela não existe,
 * a conta continua aqui — mas em um arquivo só, e não espalhada na tela, para
 * a remoção ser um `git rm`.
 *
 * Limites conhecidos: 3/1/0 fixo e desempate fixo em pontos → saldo → gols
 * feitos, quando RF26–RF28 pedem os dois configuráveis por competição.
 *
 * O chaveamento não está aqui porque não dá para calcular: a API devolve por
 * partida o FORMATO da fase (ELIMINATORIA), não o estágio (oitavas, quartas,
 * final). O que existia inferia o estágio partindo a lista ao meio, o que só
 * parecia funcionar porque o front rotulava toda eliminatória de "Final".
 */

export function computeStandings(matches: Partida[]): StandingEntry[] {
    const stats: Record<string, { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number }> = {};

    for (const partida of matches) {
        if (!partida.realizada) continue;
        const home = partida.equipeMandante;
        const away = partida.equipeVisitante;
        if (!stats[home]) stats[home] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        if (!stats[away]) stats[away] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
        const hg = partida.placarMandante ?? 0;
        const ag = partida.placarVisitante ?? 0;
        stats[home].goalsFor += hg;
        stats[home].goalsAgainst += ag;
        stats[away].goalsFor += ag;
        stats[away].goalsAgainst += hg;
        if (hg > ag) { stats[home].wins++; stats[away].losses++; }
        else if (hg < ag) { stats[away].wins++; stats[home].losses++; }
        else { stats[home].draws++; stats[away].draws++; }
    }

    const entries = Object.entries(stats).map(([teamName, s]) => ({
        teamName,
        played: s.wins + s.draws + s.losses,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDiff: s.goalsFor - s.goalsAgainst,
        points: s.wins * 3 + s.draws,
        position: 0,
    }));

    entries.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    return entries.map((e, i) => ({ ...e, position: i + 1 }));
}
