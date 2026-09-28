"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Partida } from "@/src/lib/types/partida";
import { formatarDataHora, porDataHora } from "@/src/lib/formato";

import { AgendarPartidaDialog } from "./AgendarPartidaDialog";

/**
 * Só a lista: respiro e estado vazio são da seção que a contém.
 *
 * O nome das equipes é o link para a partida, e não o cartão inteiro, porque o
 * botão de agendar vive na mesma linha — um dentro do outro dá âncora aninhada
 * em botão.
 */
export const ListaDePartidas = ({
    partidas,
    idCompeticao,
    aoAgendar,
}: {
    partidas: Partida[];
    idCompeticao: number;
    aoAgendar: (partida: Partida) => void;
}) => (
    <div className="space-y-2">
        {[...partidas].sort(porDataHora).map((partida) => {
            const placar = partida.realizada
                ? `${partida.placarMandante ?? 0} × ${partida.placarVisitante ?? 0}`
                : "×";

            return (
                <Card key={partida.id} className="transition-colors hover:border-ring">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-3 text-sm">
                            <Link
                                href={`/competicao/${idCompeticao}/partida/${partida.id}`}
                                className="min-w-0 truncate hover:underline"
                            >
                                {partida.equipeMandante}{" "}
                                <span className="numero-tabular font-mono text-muted-foreground">
                                    {placar}
                                </span>{" "}
                                {partida.equipeVisitante}
                            </Link>
                            <span className="flex shrink-0 items-center gap-2">
                                <Badge variant={partida.realizada ? "secondary" : "outline"}>
                                    {partida.realizada ? "Encerrada" : "Agendada"}
                                </Badge>
                                <AgendarPartidaDialog
                                    partida={partida}
                                    aoAgendar={aoAgendar}
                                    gatilho={<Button variant="ghost" size="sm" />}
                                />
                            </span>
                        </CardTitle>
                        <CardDescription>
                            {formatarDataHora(partida.dataHora)}
                            {partida.local ? ` · ${partida.local}` : ""}
                            {partida.fase ? ` · ${partida.fase}` : ""}
                            {partida.arbitro ? ` · apita ${partida.arbitro}` : ""}
                            {partida.realizada && partida.vencedor
                                ? ` · venceu ${partida.vencedor}`
                                : ""}
                        </CardDescription>
                    </CardHeader>
                </Card>
            );
        })}
    </div>
);
