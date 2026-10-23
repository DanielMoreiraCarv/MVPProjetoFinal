"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatarDiaEHora } from "@/src/lib/formato";
import { Partida } from "@/src/lib/types/partida";
import { enderecoPublicoDaPartida } from "@/src/lib/visao-publica";

const ehHoje = (iso?: string) => {
    if (!iso) return false;
    const data = new Date(iso);
    const agora = new Date();
    return data.toDateString() === agora.toDateString();
};

/**
 * Uma linha por jogo, com o placar quando já terminou. "Hoje" marca o que
 * provavelmente está em campo — a lista de partidas não sabe se a súmula está
 * aberta, a página da partida sabe.
 */
export const JogosEmLista = ({
    partidas,
    idCompeticao,
}: {
    partidas: Partida[];
    idCompeticao: number;
}) => (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border">
        {partidas.map((partida) => (
            <li key={partida.id}>
                <Link
                    href={enderecoPublicoDaPartida(idCompeticao, partida.id)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                >
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                            {partida.equipeMandante}{" "}
                            <span className="numero-tabular font-mono text-muted-foreground">
                                {partida.realizada
                                    ? `${partida.placarMandante ?? 0} × ${partida.placarVisitante ?? 0}`
                                    : "×"}
                            </span>{" "}
                            {partida.equipeVisitante}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {formatarDiaEHora(partida.dataHora)}
                            {partida.local ? ` · ${partida.local}` : ""}
                        </span>
                    </span>
                    {!partida.realizada && ehHoje(partida.dataHora) && (
                        <Badge className="shrink-0">Hoje</Badge>
                    )}
                </Link>
            </li>
        ))}
    </ul>
);
