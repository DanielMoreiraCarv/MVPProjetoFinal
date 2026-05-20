"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Tournaments, tournamentsSchema } from "@/src/lib/types/tournaments";
import { z } from "zod";

interface AdministrationsListProps {
    tournaments?: Tournaments[];
    callback?: (tournament: Tournaments) => void;
}

export const AdministrationsList =({ tournaments = [], callback }: AdministrationsListProps) => {
    const listSchema = z.array(tournamentsSchema);
    const validationResult = listSchema.safeParse(tournaments);

    if (!validationResult.success) {
        console.error("Invalid tournament data provided:", validationResult.error);
        return (
            <div className="p-4 text-red-500 border border-red-300 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validTournaments = validationResult.data;

    if (validTournaments.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
                Nenhuma administração encontrada
            </div>
        );
    }

    return(
        <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
            <div className="flex flex-col gap-0.75">
                {
                    validTournaments.map((tournament) => (
                        <Card className="cursor-pointer hover:border-gray-400 transition-colors"
                            key={tournament.id} onClick={() => callback?.(tournament)} >
                            <CardHeader>
                                <CardTitle>
                                    {tournament.name}
                                </CardTitle>
                                <CardDescription className="whitespace-pre-wrap">
                                    {tournament.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))
                }
            </div>
        </div>
    )
}
