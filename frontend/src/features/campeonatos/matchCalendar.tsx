"use client"

import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Partida, partidaSchema } from "@/src/lib/types/partida";
import { z } from "zod";

interface MatchCalendarProps {
    matches?: Partida[];
}

export const MatchCalendar = ({ matches = [] }: MatchCalendarProps) => {
    const listSchema = z.array(partidaSchema);
    const validationResult = listSchema.safeParse(matches);

    if (!validationResult.success) {
        console.error("Invalid partida data provided:", validationResult.error);
        return (
            <div className="p-4 text-destructive border border-destructive/40 rounded-md">
                Ops! Algum tipo incorreto de dados foram fornecidos. Verificar detalhes no console.
            </div>
        );
    }

    const validMatches = validationResult.data;

    if (validMatches.length === 0) {
        return (
            <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
                Nenhuma partida encontrada
            </div>
        );
    }

    return (
        <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
            <div className="flex flex-col gap-0.75">
                {validMatches.map((partida) => {
                    const scoreDisplay = partida.realizada
                        ? `${partida.placarMandante ?? 0} x ${partida.placarVisitante ?? 0}`
                        : "vs";

                    return (
                        <Link key={partida.id} href={`/partida/${partida.id}`} className="block">
                            <Card className="cursor-pointer hover:border-ring transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {partida.equipeMandante} {scoreDisplay} {partida.equipeVisitante}
                                        <Badge variant={partida.realizada ? "secondary" : "outline"}>
                                            {partida.realizada ? "Encerrado" : "Agendado"}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="whitespace-pre-wrap">
                                        {partida.fase}
                                        {partida.realizada && partida.vencedor ? `\nVencedor: ${partida.vencedor}` : ""}
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
