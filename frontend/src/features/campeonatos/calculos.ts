import { StandingEntry } from "@/src/features/campeonatos/StandingsTable";
import {
    BracketMatchData,
    KnockoutBracketProps,
} from "@/src/features/campeonatos/KnockoutBracket";
import { Partida } from "@/src/lib/types/partida";

/**
 * Classificação e chaveamento calculados no cliente.
 *
 * Isto é provisório e está registrado como tal: por RNF23 o cálculo precisa
 * viver só no servidor, derivado dos eventos da partida, e o front só exibir.
 * O backend já tem o motor de fases; falta a rota. Enquanto ela não existe,
 * a conta continua aqui — mas em um arquivo só, e não espalhada na tela, para
 * a remoção ser um `git rm`.
 *
 * Limites conhecidos: 3/1/0 fixo, desempate fixo em pontos → saldo → gols
 * feitos, e o chaveamento inferido partindo a lista da fase ao meio, que é
 * heurística e não o modelo real de confronto.
 */

const BRACKET_STAGE_ORDER = ["16 de finais", "Oitavas", "Quartas", "Semi-finais"] as const;

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

function toBracketMatch(m: Partida): BracketMatchData {
    return { id: m.id, homeTeam: m.equipeMandante, awayTeam: m.equipeVisitante, homeScore: m.placarMandante, awayScore: m.placarVisitante, winner: m.vencedor, date: "", finished: m.realizada };
}

export function computeBracket(matches: Partida[]): KnockoutBracketProps | null {
    const finalMatch = matches.find(m => m.fase === "Final");
    if (!finalMatch) return null;

    const topHalf: KnockoutBracketProps["topHalf"] = [];
    const bottomHalf: KnockoutBracketProps["bottomHalf"] = [];

    for (const stageName of BRACKET_STAGE_ORDER) {
        const stageMatches = matches.filter(m => m.fase === stageName).sort((a, b) => a.id - b.id);
        if (stageMatches.length === 0) continue;
        const mid = Math.ceil(stageMatches.length / 2);
        topHalf.push({ stageName, matches: stageMatches.slice(0, mid).map(toBracketMatch) });
        bottomHalf.push({ stageName, matches: stageMatches.slice(mid).map(toBracketMatch) });
    }

    return { topHalf, bottomHalf, final: toBracketMatch(finalMatch) };
}
