"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface StandingEntry {
    position: number;
    teamName: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
}

interface StandingsTableProps {
    standings: StandingEntry[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="text-xs text-gray-800">
                        <TableHead className="w-8 pl-3 text-gray-800">#</TableHead>
                        <TableHead className="text-gray-800">Time</TableHead>
                        <TableHead className="w-10 text-center font-semibold text-green-700">Pts</TableHead>
                        <TableHead className="w-8 text-center text-gray-800">PJ</TableHead>
                        <TableHead className="w-8 text-center text-gray-800">V</TableHead>
                        <TableHead className="w-8 text-center text-gray-800">E</TableHead>
                        <TableHead className="w-8 text-center text-gray-800">D</TableHead>
                        <TableHead className="w-10 text-center text-gray-800">SG</TableHead>
                        <TableHead className="w-8 text-center text-gray-800">GP</TableHead>
                        <TableHead className="w-8 text-center pr-3 text-gray-800">GS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standings.map((entry, i) => (
                        <TableRow key={entry.teamName} className={i % 2 !== 0 ? "bg-gray-50" : ""}>
                            <TableCell className="pl-3 text-gray-400">{entry.position}</TableCell>
                            <TableCell className="font-medium text-gray-900">{entry.teamName}</TableCell>
                            <TableCell className="text-center font-bold text-green-700">{entry.points}</TableCell>
                            <TableCell className="text-center text-gray-600">{entry.played}</TableCell>
                            <TableCell className="text-center text-gray-600">{entry.wins}</TableCell>
                            <TableCell className="text-center text-gray-600">{entry.draws}</TableCell>
                            <TableCell className="text-center text-gray-600">{entry.losses}</TableCell>
                            <TableCell className={`text-center font-medium ${entry.goalDiff > 0 ? "text-green-600" : entry.goalDiff < 0 ? "text-red-500" : "text-gray-600"}`}>
                                {entry.goalDiff > 0 ? `+${entry.goalDiff}` : entry.goalDiff}
                            </TableCell>
                            <TableCell className="text-center text-gray-600">{entry.goalsFor}</TableCell>
                            <TableCell className="text-center text-gray-600 pr-3">{entry.goalsAgainst}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
