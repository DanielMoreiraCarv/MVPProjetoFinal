"use client"

import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match, matchSchema } from "@/src/lib/types/match";
import { z } from "zod";

interface MatchCalendarProps {
    matches?: Match[];
}

export const MatchCalendar = ({ matches = [] }: MatchCalendarProps) => {
    const listSchema = z.array(matchSchema);
    const validationResult = listSchema.safeParse(matches);

    if (!validationResult.success) {
        console.error("Invalid match data provided:", validationResult.error);
        return (
            <div className="p-4 text-red-500 border border-red-300 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validMatches = validationResult.data;

    if (validMatches.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
                Nenhuma partida encontrada
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
            <div className="flex flex-col gap-0.75">
                {validMatches.map((match) => {
                    const scoreDisplay = match.finished
                        ? `${match.homeScore ?? 0} x ${match.awayScore ?? 0}`
                        : "vs";

                    return (
                        <Link key={match.id} href={`/partidas/${match.id}`}>
                            <Card className="cursor-pointer hover:border-gray-400 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {match.homeTeam} {scoreDisplay} {match.awayTeam}
                                        <Badge variant={match.finished ? "secondary" : "outline"}>
                                            {match.finished ? "Encerrado" : "Agendado"}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="whitespace-pre-wrap">
                                        {match.date}
                                        {"\n"}
                                        {match.stageName}
                                        {match.finished && match.winner ? `\nVencedor: ${match.winner}` : ""}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
