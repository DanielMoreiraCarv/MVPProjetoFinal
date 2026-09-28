"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import Link from "next/link";
import { Competicao, competicaoSchema } from "@/src/lib/types/competicao";
import { z } from "zod";

interface CompetitionsListProps {
    competitions?: Competicao[];
}

export const CompetitionsList =({ competitions = [] }: CompetitionsListProps) => {
    const listSchema = z.array(competicaoSchema);
    const validationResult = listSchema.safeParse(competitions);

    if (!validationResult.success) {
        console.error("Invalid competicao data provided:", validationResult.error);
        return (
            <div className="p-4 text-destructive border border-destructive/40 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validCompetitions = validationResult.data;

    if (validCompetitions.length === 0) {
        return (
            <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
                Nenhuma competição encontrada
            </div>
        );
    }

    return(
        <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
            <div className="flex flex-col gap-0.75">
                {
                    validCompetitions.map((competicao) => (
                        <Card key={competicao.id}>
                            <CardHeader>
                                <CardTitle>
                                    <Link href={`/campeonatos/${competicao.id}`}>
                                        {competicao.nome}
                                    </Link>
                                </CardTitle>
                                <CardDescription className="whitespace-pre-wrap">
                                    {competicao.descricao}
                                    {"\n"}
                                    {competicao.modalidade} - {competicao.categoria}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))
                }
            </div>
        </div>
    )
}
