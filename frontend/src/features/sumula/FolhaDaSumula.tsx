import { COLUNAS_DA_SUMULA, contar } from "@/src/features/sumula/eventos";
import { formatarDataHora } from "@/src/lib/formato";
import { Atleta } from "@/src/lib/types/atleta";
import { Partida } from "@/src/lib/types/partida";
import { Sumula } from "@/src/lib/types/sumula";

/** Linhas a mais em cada elenco, para quem chega e não estava cadastrado. */
const LINHAS_EM_BRANCO = 3;

const Dado = ({ rotulo, valor }: { rotulo: string; valor: string }) => (
    <div>
        <span className="text-muted-foreground">{rotulo}: </span>
        <span className="font-medium">{valor}</span>
    </div>
);

const Elenco = ({
    equipe,
    atletas,
    sumula,
}: {
    equipe: string;
    atletas: Atleta[];
    sumula: Sumula | null;
}) => {
    const emOrdem = [...atletas].sort((a, b) => (a.numCamisa ?? 999) - (b.numCamisa ?? 999));
    const celula = "border border-border px-1 py-[3px]";

    return (
        <table className="w-full table-fixed border-collapse text-[10px] leading-tight">
            {/* As larguras vêm daqui: a primeira linha do cabeçalho é o nome da
                equipe ocupando tudo, e sem isto a tabela fixa dividia em partes
                iguais — o nome do atleta ficava com a largura de uma coluna de
                gol. */}
            <colgroup>
                <col className="w-[7mm]" />
                <col />
                {COLUNAS_DA_SUMULA.map((coluna) => (
                    <col key={coluna.tipo} className="w-[7.5mm]" />
                ))}
            </colgroup>
            <thead>
                <tr>
                    <th colSpan={2 + COLUNAS_DA_SUMULA.length} className={`${celula} bg-muted text-left text-[11px] font-semibold`}>
                        {equipe}
                    </th>
                </tr>
                <tr className="text-muted-foreground">
                    <th className={`${celula} font-medium`}>Nº</th>
                    <th className={`${celula} text-left font-medium`}>Atleta</th>
                    {COLUNAS_DA_SUMULA.map((coluna) => (
                        <th key={coluna.tipo} className={`${celula} font-medium`}>
                            {coluna.sigla}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {emOrdem.map((atleta) => (
                    <tr key={atleta.id}>
                        <td className={`${celula} numero-tabular text-center font-mono`}>{atleta.numCamisa ?? ""}</td>
                        <td className={`${celula} truncate`}>{atleta.nome}</td>
                        {COLUNAS_DA_SUMULA.map((coluna) => {
                            const quantos = sumula ? contar(sumula.eventos, atleta.id, coluna.tipo) : 0;
                            return (
                                <td key={coluna.tipo} className={`${celula} numero-tabular text-center font-mono`}>
                                    {quantos > 0 ? quantos : ""}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                {Array.from({ length: LINHAS_EM_BRANCO }).map((_, i) => (
                    <tr key={`branco-${i}`}>
                        <td className={celula}>&nbsp;</td>
                        <td className={celula} />
                        {COLUNAS_DA_SUMULA.map((coluna) => (
                            <td key={coluna.tipo} className={celula} />
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

/**
 * A súmula como papel: A4 deitado, os dois elencos lado a lado, o placar em
 * cima e as assinaturas embaixo. Só aparece na impressão — na tela quem
 * trabalha é a versão de toque.
 *
 * Sem súmula lançada ela sai em branco, com os elencos e as células vazias:
 * serve de contingência para anotar à mão (RF145).
 */
export const FolhaDaSumula = ({
    partida,
    sumula,
    atletasMandante,
    atletasVisitante,
}: {
    partida: Partida;
    sumula: Sumula | null;
    atletasMandante: Atleta[];
    atletasVisitante: Atleta[];
}) => (
    <div className="flex flex-col gap-3 text-[11px] text-foreground">
        <header className="flex items-start justify-between gap-6 border-b border-border pb-2">
            <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Súmula da partida</p>
                <p className="text-sm font-semibold">{partida.nomeCompeticao}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[10px]">
                <Dado rotulo="Data e hora" valor={formatarDataHora(partida.dataHora)} />
                <Dado rotulo="Fase" valor={partida.fase ?? "—"} />
                <Dado rotulo="Local" valor={partida.local ?? "—"} />
                <Dado rotulo="Árbitro" valor={sumula?.arbitro || partida.arbitro || "—"} />
            </div>
        </header>

        <div className="flex items-center justify-center gap-6">
            <p className="flex-1 text-right text-lg font-semibold">{partida.equipeMandante}</p>
            <p className="numero-tabular rounded-lg border border-border px-4 py-1 font-mono text-3xl font-bold">
                {sumula ? sumula.placarMandante : "  "}
                <span className="px-2 text-muted-foreground">×</span>
                {sumula ? sumula.placarVisitante : "  "}
            </p>
            <p className="flex-1 text-lg font-semibold">{partida.equipeVisitante}</p>
        </div>

        <div className="grid grid-cols-2 items-start gap-4">
            <Elenco equipe={partida.equipeMandante} atletas={atletasMandante} sumula={sumula} />
            <Elenco equipe={partida.equipeVisitante} atletas={atletasVisitante} sumula={sumula} />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
            <div className="min-h-16 rounded-md border border-border p-2">
                <p className="text-[10px] text-muted-foreground">Observações</p>
                <p className="whitespace-pre-wrap">{sumula?.observacoes}</p>
            </div>
            <p className="text-[9px] leading-snug text-muted-foreground">
                {COLUNAS_DA_SUMULA.map((coluna) => `${coluna.sigla} — ${coluna.nome}`).join(" · ")}
            </p>
        </div>

        <footer className="mt-4 grid grid-cols-3 gap-8 text-center text-[10px]">
            {["Árbitro", `Capitão — ${partida.equipeMandante}`, `Capitão — ${partida.equipeVisitante}`].map(
                (quem) => (
                    <div key={quem} className="border-t border-foreground pt-1">
                        {quem}
                    </div>
                ),
            )}
        </footer>

        {sumula?.assinada && sumula.dataFechamento && (
            <p className="text-right text-[9px] text-muted-foreground">
                Assinada no sistema em {formatarDataHora(sumula.dataFechamento)}
            </p>
        )}
    </div>
);
