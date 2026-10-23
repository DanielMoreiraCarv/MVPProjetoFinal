import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatarDataHora } from "@/src/lib/formato";
import { Partida } from "@/src/lib/types/partida";
import { Sumula } from "@/src/lib/types/sumula";

export type SituacaoDaPartida = "agendada" | "aoVivo" | "encerrada";

/**
 * Ao vivo é súmula aberta e ainda não assinada: é a mesa anotando. Sem súmula
 * a partida só está agendada; com a partida encerrada ou a súmula assinada,
 * o placar não muda mais.
 */
export const situacaoDaPartida = (partida: Partida, sumula: Sumula | null): SituacaoDaPartida =>
    partida.realizada || sumula?.assinada ? "encerrada" : sumula ? "aoVivo" : "agendada";

const placarDa = (partida: Partida, sumula: Sumula | null) => {
    if (partida.realizada) return [partida.placarMandante ?? 0, partida.placarVisitante ?? 0];
    if (sumula) return [sumula.placarMandante, sumula.placarVisitante];
    return null;
};

const Situacao = ({ situacao }: { situacao: SituacaoDaPartida }) =>
    situacao === "aoVivo" ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-destructive">
            <span className="size-2 animate-pulse rounded-full bg-destructive" />
            Ao vivo
        </span>
    ) : situacao === "encerrada" ? (
        <Badge variant="secondary">Encerrada</Badge>
    ) : (
        <Badge variant="outline">Agendada</Badge>
    );

export const PlacarAoVivo = ({
    partida,
    sumula,
    acao,
}: {
    partida: Partida;
    sumula: Sumula | null;
    acao?: React.ReactNode;
}) => {
    const situacao = situacaoDaPartida(partida, sumula);
    const placar = placarDa(partida, sumula);

    return (
        <section
            aria-label="Placar"
            className={cn(
                "space-y-4 rounded-3xl border bg-card px-5 py-5 sm:px-8",
                situacao === "aoVivo" ? "border-destructive/30" : "border-border",
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <Situacao situacao={situacao} />
                {acao}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
                <p className="min-w-0 text-right text-base font-semibold break-words sm:text-xl">
                    {partida.equipeMandante}
                </p>
                <p
                    className="numero-tabular font-mono text-4xl font-bold tracking-tight sm:text-6xl"
                    aria-label={
                        placar ? `${placar[0]} a ${placar[1]}` : "Partida ainda sem placar"
                    }
                >
                    {placar ? (
                        <>
                            {placar[0]}
                            <span className="px-2 text-muted-foreground">×</span>
                            {placar[1]}
                        </>
                    ) : (
                        <span className="text-muted-foreground">×</span>
                    )}
                </p>
                <p className="min-w-0 text-left text-base font-semibold break-words sm:text-xl">
                    {partida.equipeVisitante}
                </p>
            </div>

            <p className="text-center text-xs text-muted-foreground">
                {situacao === "encerrada" && partida.vencedor
                    ? `Venceu ${partida.vencedor}`
                    : situacao === "encerrada"
                      ? "Fim de jogo"
                      : formatarDataHora(partida.dataHora, "Data a definir")}
                {partida.local ? ` · ${partida.local}` : ""}
            </p>
        </section>
    );
};
