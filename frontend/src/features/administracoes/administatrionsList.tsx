"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Administracao, administracaoSchema } from "@/src/lib/types/administracao";
import { z } from "zod";

interface AdministrationsListProps {
    tournaments?: Administracao[];
    callback?: (administracao: Administracao) => void;
}

export const AdministrationsList =({ tournaments = [], callback }: AdministrationsListProps) => {
    const listSchema = z.array(administracaoSchema);
    const validationResult = listSchema.safeParse(tournaments);

    if (!validationResult.success) {
        console.error("Invalid administracao data provided:", validationResult.error);
        return (
            <div className="p-4 text-destructive border border-destructive/40 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validTournaments = validationResult.data;

    if (validTournaments.length === 0) {
        return (
            <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
                Nenhuma administração encontrada
            </div>
        );
    }

    return(
        <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
            <div className="flex flex-col gap-0.75">
                {
                    validTournaments.map((administracao) => (
                        <Card className="cursor-pointer hover:border-ring transition-colors"
                            key={administracao.id} onClick={() => callback?.(administracao)} >
                            <CardHeader>
                                <CardTitle>
                                    {administracao.nome}
                                </CardTitle>
                                <CardDescription className="whitespace-pre-wrap">
                                    {administracao.descricao}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))
                }
            </div>
        </div>
    )
}
