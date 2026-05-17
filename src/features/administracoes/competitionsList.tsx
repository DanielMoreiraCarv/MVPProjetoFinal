"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { useState } from "react"
import { Competition, competitionSchema } from "@/src/lib/types/competition";
import { z } from "zod";

interface CompetitionsListProps {
    competitions?: Competition[];
}

export const CompetitionsList =({ competitions = [] }: CompetitionsListProps) => {
    const listSchema = z.array(competitionSchema);
    const validationResult = listSchema.safeParse(competitions);

    if (!validationResult.success) {
        console.error("Invalid competition data provided:", validationResult.error);
        return (
            <div className="p-4 text-red-500 border border-red-300 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validCompetitions = validationResult.data;

    if (validCompetitions.length === 0) {
        return (
            <div className="border border-gray-300 p-4 rounded-md flex-1">
                Nenhuma competição encontrada
            </div>
        );
    }

    return(
        <div className="border border-gray-300 p-4 rounded-md flex-1">
            <div className="flex flex-col gap-0.75">
                {
                    validCompetitions.map((competition) => (
                        <Card key={competition.id}>
                            <CardHeader>
                                <CardTitle>
                                    {competition.name}
                                </CardTitle>
                                <CardDescription className="whitespace-pre-wrap">
                                    {competition.description}
                                    {"\n"}
                                    {competition.sport} - {competition.modality}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))
                }
            </div>
        </div>
    )
}
