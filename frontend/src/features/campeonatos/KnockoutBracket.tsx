"use client"

import Link from "next/link";

export interface BracketMatchData {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    winner?: string;
    date: string;
    finished: boolean;
    equipeMandante?: string;
    equipeVisitante?: string;
    placarMandante?: number;
    placarVisitante?: number;
    realizada?: boolean;
}

export interface BracketRound {
    stageName: string;
    matches: BracketMatchData[];
    fase?: string;
}

export interface KnockoutBracketProps {
    topHalf: BracketRound[];
    bottomHalf: BracketRound[];
    final: BracketMatchData;
}

const SLOT_HEIGHT = 88;
const HALF_GAP = 48;

function MatchCard({ partida }: { partida: BracketMatchData }) {
    return (
        <Link
            href={`/partida/${partida.id}`}
            className="block w-40 border border-border rounded-md bg-card p-2 text-xs shadow-sm hover:border-primary hover:shadow transition-all"
        >
            <div className={`flex items-center justify-between gap-1 ${partida.winner === partida.equipeMandante ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                <span className="truncate">{partida.equipeMandante}</span>
                <span className="shrink-0 font-mono w-4 text-right">{partida.realizada ? partida.placarMandante : "–"}</span>
            </div>
            <div className="my-0.5 border-t border-border" />
            <div className={`flex items-center justify-between gap-1 ${partida.winner === partida.equipeVisitante ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                <span className="truncate">{partida.equipeVisitante}</span>
                <span className="shrink-0 font-mono w-4 text-right">{partida.realizada ? partida.placarVisitante : "–"}</span>
            </div>
        </Link>
    );
}

function RoundHalf({ matches, height }: { matches: BracketMatchData[]; height: number }) {
    return (
        <div className="flex flex-col justify-around" style={{ height }}>
            {matches.map((partida) => (
                <div key={partida.id} className="border-r-2 border-border pr-2">
                    <MatchCard partida={partida} />
                </div>
            ))}
        </div>
    );
}

export function KnockoutBracket({ topHalf, bottomHalf, final }: KnockoutBracketProps) {
    const firstRoundCount = topHalf[0]?.matches.length ?? 1;
    const halfHeight = firstRoundCount * SLOT_HEIGHT;
    const totalHeight = halfHeight * 2 + HALF_GAP;

    return (
        <div className="overflow-x-auto rounded-lg bg-muted/40 p-4">
            <div className="inline-flex gap-1 min-w-max">
                {topHalf.map((topRound, idx) => {
                    const bottomRound = bottomHalf[idx];
                    return (
                        <div key={topRound.fase} className="flex flex-col w-44">
                            <p className="text-center text-[10px] font-semibold tracking-widest uppercase text-muted-foreground pb-2">
                                {topRound.fase}
                            </p>
                            <RoundHalf matches={topRound.matches} height={halfHeight} />
                            <div style={{ height: HALF_GAP }} />
                            <RoundHalf matches={bottomRound.matches} height={halfHeight} />
                        </div>
                    );
                })}

                <div className="flex flex-col w-44">
                    <p className="text-center text-[10px] font-semibold tracking-widest uppercase text-muted-foreground pb-2">
                        Final
                    </p>
                    <div className="flex items-center" style={{ height: totalHeight }}>
                        <MatchCard partida={final} />
                    </div>
                </div>
            </div>
        </div>
    );
}
