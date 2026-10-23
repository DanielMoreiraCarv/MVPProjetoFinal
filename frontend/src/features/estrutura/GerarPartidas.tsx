"use client";

import { AlertTriangle, Check, Play } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { Estrutura, gerarPartidasDaCompeticao } from "@/src/lib/api/competicoes";
import { useAvisos } from "@/src/lib/avisos";

/**
 * O botão único que gera as partidas da competição, com a estrutura inteira
 * à vista: cada fase com quantas entram e quantas avançam, e o que não fecha.
 *
 * Gerar fase por fase deixava nascer as partidas da primeira de uma
 * estrutura que não fechava — 24 classificados para uma eliminatória —, e o
 * erro só aparecia quando a seguinte fosse montada. Aqui nada é gerado se
 * alguma fase reprovar; a primeira sai na hora, e as seguintes quando a
 * anterior terminar.
 */
export const GerarPartidas = ({
    idCompeticao,
    estrutura,
    aoGerar,
    mostrarLinkDaEstrutura = false,
}: {
    idCompeticao: number;
    estrutura: Estrutura;
    aoGerar: () => void;
    /** Fora da Estrutura, um atalho para ir corrigir lá. */
    mostrarLinkDaEstrutura?: boolean;
}) => {
    const avisos = useAvisos();
    const primeira = estrutura.fases[0];

    const gerar = async () => {
        try {
            const quantas = await gerarPartidasDaCompeticao(idCompeticao);
            avisos.sucesso(
                `${quantas} ${quantas === 1 ? "partida gerada" : "partidas geradas"} em ${primeira?.nome}.`,
                "As fases seguintes são geradas quando a anterior terminar.",
            );
            aoGerar();
        } catch (causa) {
            avisos.erro(causa, "Nenhuma partida foi gerada");
        }
    };

    return (
        <div className="space-y-4 rounded-3xl border border-border bg-card px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-0.5">
                    <p className="text-sm font-semibold">
                        {estrutura.pronta ? "A estrutura fecha" : "A estrutura ainda não fecha"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {estrutura.pronta
                            ? `Gerar cria os confrontos de ${primeira?.nome}; as fases seguintes nascem quando a anterior terminar.`
                            : "Corrija o que está apontado abaixo. Nenhuma partida é gerada enquanto alguma fase não fechar."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {mostrarLinkDaEstrutura && (
                        <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            render={<Link href={`/competicao/${idCompeticao}/estrutura`} />}
                        >
                            Ajustar a estrutura
                        </Button>
                    )}
                    <Confirmacao
                        gatilho={
                            <Button size="sm" disabled={!estrutura.pronta}>
                                <Play />
                                Gerar partidas
                            </Button>
                        }
                        titulo="Gerar as partidas da competição?"
                        descricao={`Os confrontos de ${primeira?.nome} são criados agora e a competição passa a "Em andamento" — a estrutura deixa de poder ser editada. As fases seguintes são geradas quando a anterior terminar.`}
                        rotuloDaAcao="Gerar partidas"
                        destrutiva={false}
                        aoConfirmar={gerar}
                    />
                </div>
            </div>

            <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {estrutura.fases.map((fase, i) => (
                    <li key={fase.idFase} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                        <span
                            className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                                fase.valida ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                            )}
                        >
                            {fase.valida ? <Check className="size-3" /> : <AlertTriangle className="size-3" />}
                        </span>
                        <div className="min-w-0 flex-1 space-y-0.5">
                            <p>
                                <span className="font-medium">
                                    {i + 1}. {fase.nome}
                                </span>
                                <span className="text-muted-foreground">
                                    {fase.quantosEntram !== null && ` · ${fase.quantosEntram} entram`}
                                    {fase.quantosAvancam !== null &&
                                        i < estrutura.fases.length - 1 &&
                                        ` · ${fase.quantosAvancam} avançam`}
                                </span>
                            </p>
                            {fase.erros.map((motivo) => (
                                <p key={motivo} className="text-xs text-destructive">
                                    {motivo}
                                </p>
                            ))}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};
