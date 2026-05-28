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
}

export interface BracketRound {
    stageName: string;
    matches: BracketMatchData[];
}

export interface KnockoutBracketProps {
    topHalf: BracketRound[];
    bottomHalf: BracketRound[];
    final: BracketMatchData;
}

const SLOT_HEIGHT = 88;
const HALF_GAP = 48;

function MatchCard({ match }: { match: BracketMatchData }) {
    return (
        <Link
            href={`/partidas/${match.id}`}
            className="block w-40 border border-gray-200 rounded-md bg-white p-2 text-xs shadow-sm hover:border-green-500 hover:shadow transition-all"
        >
            <div className={`flex items-center justify-between gap-1 ${match.winner === match.homeTeam ? "font-semibold text-black" : "text-gray-500"}`}>
                <span className="truncate">{match.homeTeam}</span>
                <span className="shrink-0 font-mono w-4 text-right">{match.finished ? match.homeScore : "–"}</span>
            </div>
            <div className="my-0.5 border-t border-gray-100" />
            <div className={`flex items-center justify-between gap-1 ${match.winner === match.awayTeam ? "font-semibold text-black" : "text-gray-500"}`}>
                <span className="truncate">{match.awayTeam}</span>
                <span className="shrink-0 font-mono w-4 text-right">{match.finished ? match.awayScore : "–"}</span>
            </div>
        </Link>
    );
}

function RoundHalf({ matches, height }: { matches: BracketMatchData[]; height: number }) {
    return (
        <div className="flex flex-col justify-around" style={{ height }}>
            {matches.map((match) => (
                <div key={match.id} className="border-r-2 border-gray-200 pr-2">
                    <MatchCard match={match} />
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
        <div className="overflow-x-auto rounded-lg bg-gray-50 p-4">
            <div className="inline-flex gap-1 min-w-max">
                {topHalf.map((topRound, idx) => {
                    const bottomRound = bottomHalf[idx];
                    return (
                        <div key={topRound.stageName} className="flex flex-col w-44">
                            <p className="text-center text-[10px] font-semibold tracking-widest uppercase text-gray-400 pb-2">
                                {topRound.stageName}
                            </p>
                            <RoundHalf matches={topRound.matches} height={halfHeight} />
                            <div style={{ height: HALF_GAP }} />
                            <RoundHalf matches={bottomRound.matches} height={halfHeight} />
                        </div>
                    );
                })}

                <div className="flex flex-col w-44">
                    <p className="text-center text-[10px] font-semibold tracking-widest uppercase text-gray-400 pb-2">
                        Final
                    </p>
                    <div className="flex items-center" style={{ height: totalHeight }}>
                        <MatchCard match={final} />
                    </div>
                </div>
            </div>
        </div>
    );
}
