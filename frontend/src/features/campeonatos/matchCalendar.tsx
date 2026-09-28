"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Partida } from "@/src/lib/types/partida";

// Só a lista: respiro e estado vazio são da seção que a contém.
export const MatchCalendar = ({ matches = [] }: { matches?: Partida[] }) => (
    <div className="space-y-2">
        {matches.map((partida) => {
            const placar = partida.realizada
                ? `${partida.placarMandante ?? 0} × ${partida.placarVisitante ?? 0}`
                : "×";

            return (
                <Link key={partida.id} href={`/partida/${partida.id}`} className="block">
                    <Card className="transition-colors hover:border-ring">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between gap-3 text-sm">
                                <span className="min-w-0 truncate">
                                    {partida.equipeMandante}{" "}
                                    <span className="numero-tabular font-mono text-muted-foreground">
                                        {placar}
                                    </span>{" "}
                                    {partida.equipeVisitante}
                                </span>
                                <Badge variant={partida.realizada ? "secondary" : "outline"}>
                                    {partida.realizada ? "Encerrada" : "Agendada"}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                {partida.fase}
                                {partida.realizada && partida.vencedor
                                    ? ` · venceu ${partida.vencedor}`
                                    : ""}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            );
        })}
    </div>
);
