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
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="text-xs text-foreground">
                        <TableHead className="w-8 pl-3 text-foreground">#</TableHead>
                        <TableHead className="text-foreground">Time</TableHead>
                        <TableHead className="w-10 text-center font-semibold text-primary">Pts</TableHead>
                        <TableHead className="w-8 text-center text-foreground">PJ</TableHead>
                        <TableHead className="w-8 text-center text-foreground">V</TableHead>
                        <TableHead className="w-8 text-center text-foreground">E</TableHead>
                        <TableHead className="w-8 text-center text-foreground">D</TableHead>
                        <TableHead className="w-10 text-center text-foreground">SG</TableHead>
                        <TableHead className="w-8 text-center text-foreground">GP</TableHead>
                        <TableHead className="w-8 text-center pr-3 text-foreground">GS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standings.map((entry, i) => (
                        <TableRow key={entry.teamName} className={i % 2 !== 0 ? "bg-muted/40" : ""}>
                            <TableCell className="pl-3 text-muted-foreground">{entry.position}</TableCell>
                            <TableCell className="font-medium text-foreground">{entry.teamName}</TableCell>
                            <TableCell className="text-center font-bold text-primary">{entry.points}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{entry.played}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{entry.wins}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{entry.draws}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{entry.losses}</TableCell>
                            <TableCell className={`text-center font-medium ${entry.goalDiff > 0 ? "text-success" : entry.goalDiff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {entry.goalDiff > 0 ? `+${entry.goalDiff}` : entry.goalDiff}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">{entry.goalsFor}</TableCell>
                            <TableCell className="text-center text-muted-foreground pr-3">{entry.goalsAgainst}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
