import { cn } from "@/lib/utils";
import { COLUNAS_DA_SUMULA, COR_DO_EVENTO } from "@/src/features/sumula/eventos";
import { Partida } from "@/src/lib/types/partida";
import { EventoDaSumula } from "@/src/lib/types/sumula";

const HORA = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

const nomeDo = (evento: EventoDaSumula) =>
    COLUNAS_DA_SUMULA.find((coluna) => coluna.tipo === evento.tipo)?.nome ?? evento.tipo;

const siglaDo = (evento: EventoDaSumula) =>
    COLUNAS_DA_SUMULA.find((coluna) => coluna.tipo === evento.tipo)?.sigla ?? "";

/**
 * Gols e cartões, do mais recente para o primeiro. As faltas ficam na tabela
 * por atleta: numa linha do tempo de torcida elas soterram o gol.
 *
 * O lance fica do lado da equipe do atleta — o gol contra também, que é de
 * quem o fez, ainda que some para o outro lado.
 */
export const LancesDaPartida = ({
    partida,
    eventos,
}: {
    partida: Partida;
    eventos: EventoDaSumula[];
}) => {
    const lances = eventos.filter((evento) => COR_DO_EVENTO[evento.tipo]).reverse();

    if (lances.length === 0) {
        return (
            <p className="rounded-3xl border border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">
                Nenhum gol ou cartão até agora.
            </p>
        );
    }

    return (
        <ol className="divide-y divide-border overflow-hidden rounded-3xl border border-border">
            {lances.map((evento) => {
                const doMandante = evento.idEquipe === partida.idEquipeMandante;
                const equipe = doMandante ? partida.equipeMandante : partida.equipeVisitante;

                return (
                    <li
                        key={evento.id}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5",
                            !doMandante && "sm:flex-row-reverse sm:text-right",
                        )}
                    >
                        <span className="numero-tabular w-11 shrink-0 font-mono text-xs text-muted-foreground">
                            {HORA.format(new Date(evento.registradoEm))}
                        </span>
                        <span
                            className={cn(
                                "inline-flex h-6 min-w-8 shrink-0 items-center justify-center rounded-lg px-1.5 font-mono text-xs font-semibold",
                                COR_DO_EVENTO[evento.tipo],
                            )}
                            title={nomeDo(evento)}
                        >
                            {siglaDo(evento)}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                                {nomeDo(evento)} — {evento.nomeAtleta}
                                {evento.numCamisa != null && (
                                    <span className="font-normal text-muted-foreground"> · nº {evento.numCamisa}</span>
                                )}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                                {equipe}
                                {evento.automatico && " · lançado automaticamente"}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ol>
    );
};
