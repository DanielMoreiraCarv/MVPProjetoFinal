"use client"

import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Equipe, equipeSchema } from "@/src/lib/types/equipe";
import { z } from "zod";

interface TeamsListProps {
    equipes?: Equipe[];
}

export const TeamsList = ({ equipes = [] }: TeamsListProps) => {
    const listSchema = z.array(equipeSchema);
    const validationResult = listSchema.safeParse(equipes);

    if (!validationResult.success) {
        console.error("Invalid equipe data provided:", validationResult.error);
        return (
            <div className="p-4 text-destructive border border-destructive/40 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validTeams = validationResult.data;

    if (validTeams.length === 0) {
        return (
            <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
                Nenhum time encontrado
            </div>
        );
    }

    return (
        <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
            <div className="flex flex-col gap-0.75">
                {validTeams.map((equipe) => (
                    <Link key={equipe.id} href={`/equipe/${equipe.id}`}>
                        <Card className="cursor-pointer hover:border-ring transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {equipe.nome}
                                    <Badge variant="secondary">
                                        {equipe.atletas.length} jogador{equipe.atletas.length !== 1 ? "es" : ""}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>{equipe.modalidade.nome}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};
