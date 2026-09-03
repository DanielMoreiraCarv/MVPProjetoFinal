"use client"

import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Team, teamSchema } from "@/src/lib/types/team";
import { z } from "zod";

interface TeamsListProps {
    teams?: Team[];
}

export const TeamsList = ({ teams = [] }: TeamsListProps) => {
    const listSchema = z.array(teamSchema);
    const validationResult = listSchema.safeParse(teams);

    if (!validationResult.success) {
        console.error("Invalid team data provided:", validationResult.error);
        return (
            <div className="p-4 text-red-500 border border-red-300 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validTeams = validationResult.data;

    if (validTeams.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
                Nenhum time encontrado
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
            <div className="flex flex-col gap-0.75">
                {validTeams.map((team) => (
                    <Link key={team.id} href={`/times/${team.id}`}>
                        <Card className="cursor-pointer hover:border-gray-400 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {team.name}
                                    <Badge variant="secondary">
                                        {team.players.length} jogador{team.players.length !== 1 ? "es" : ""}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>{team.sport.name}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};
