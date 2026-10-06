"use client";

import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chaveamento, ConfrontoDaChave, EtapaDaChave, LadoDaChave } from "@/src/lib/api/fases";

/** A partir das oitavas a chave cabe desenhada; antes disso vira lista por etapa. */
const EQUIPES_NO_DESENHO = 16;

const ALTURA_DO_CARTAO = 68;
const ESPACO_ENTRE_CARTOES = 16;
const LARGURA_DA_COLUNA = 212;
const ESPACO_ENTRE_COLUNAS = 52;
const ALTURA_DO_TITULO = 28;

const Lado = ({
    lado,
    gols,
    venceu,
    decidido,
}: {
    lado: LadoDaChave;
    gols: number | null;
    venceu: boolean;
    decidido: boolean;
}) => (
    <div
        className={cn(
            "flex h-[30px] items-center justify-between gap-2 px-3 text-sm",
            venceu && "bg-accent font-semibold text-accent-foreground",
            decidido && !venceu && "text-muted-foreground",
        )}
    >
        <span className={cn("min-w-0 truncate", !lado.idEquipe && "text-xs italic text-muted-foreground")}>
            {lado.nomeEquipe ?? lado.origem ?? "A definir"}
        </span>
        <span className="numero-tabular shrink-0 font-mono">{gols ?? ""}</span>
    </div>
);

const Cartao = ({
    confronto,
    idCompeticao,
    className,
    style,
}: {
    confronto: ConfrontoDaChave;
    idCompeticao: number;
    className?: string;
    style?: React.CSSProperties;
}) => {
    const corpo = (
        <>
            <Lado
                lado={confronto.mandante}
                gols={confronto.placarMandante}
                venceu={confronto.idVencedor !== null && confronto.idVencedor === confronto.mandante.idEquipe}
                decidido={confronto.decidido}
            />
            <div className="h-px bg-border" />
            <Lado
                lado={confronto.visitante}
                gols={confronto.placarVisitante}
                venceu={confronto.idVencedor !== null && confronto.idVencedor === confronto.visitante.idEquipe}
                decidido={confronto.decidido}
            />
        </>
    );
    const classes = cn(
        "block overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-colors",
        className,
    );
    const titulo = `Jogo ${confronto.jogo}`;

    // O cartão leva à partida quando ela existe; com ida e volta, à da ida.
    return confronto.idsDasPartidas.length > 0 ? (
        <Link
            href={`/competicao/${idCompeticao}/partida/${confronto.idsDasPartidas[0]}`}
            className={cn(classes, "hover:border-ring")}
            style={style}
            title={titulo}
        >
            {corpo}
        </Link>
    ) : (
        <div className={classes} style={style} title={titulo}>
            {corpo}
        </div>
    );
};

/**
 * A chave desenhada: uma coluna por etapa, cada confronto no meio dos dois que
 * o alimentam, e as linhas ligando. A ordem já vem do servidor — o par
 * vizinho de uma coluna alimenta o mesmo confronto da coluna seguinte —,
 * então a posição é só aritmética.
 */
const Desenho = ({
    etapas,
    idCompeticao,
}: {
    etapas: EtapaDaChave[];
    idCompeticao: number;
}) => {
    const primeira = etapas[0].confrontos.length;
    const altura = primeira * (ALTURA_DO_CARTAO + ESPACO_ENTRE_CARTOES);
    const largura = etapas.length * LARGURA_DA_COLUNA + (etapas.length - 1) * ESPACO_ENTRE_COLUNAS;
    const x = (coluna: number) => coluna * (LARGURA_DA_COLUNA + ESPACO_ENTRE_COLUNAS);
    const y = (coluna: number, indice: number) =>
        ((indice + 0.5) * altura) / etapas[coluna].confrontos.length;

    const linhas: string[] = [];
    etapas.forEach((etapa, coluna) => {
        if (coluna === 0) return;
        const meio = x(coluna) - ESPACO_ENTRE_COLUNAS / 2;
        etapa.confrontos.forEach((_, indice) => {
            for (const alimentador of [indice * 2, indice * 2 + 1]) {
                if (alimentador >= etapas[coluna - 1].confrontos.length) continue;
                const origem = y(coluna - 1, alimentador);
                linhas.push(
                    `M ${x(coluna - 1) + LARGURA_DA_COLUNA} ${origem} H ${meio} V ${y(coluna, indice)} H ${x(coluna)}`,
                );
            }
        });
    });

    const final = etapas[etapas.length - 1];
    const campeao =
        final.confrontos.length === 1 && final.confrontos[0].decidido
            ? [final.confrontos[0].mandante, final.confrontos[0].visitante].find(
                  (lado) => lado.idEquipe === final.confrontos[0].idVencedor,
              )
            : undefined;

    return (
        <div className="overflow-x-auto rounded-2xl border border-border bg-muted/30 p-5">
            <div className="relative" style={{ width: largura, height: altura + ALTURA_DO_TITULO }}>
                {etapas.map((etapa, coluna) => (
                    <p
                        key={etapa.rodada}
                        className="absolute top-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        style={{ left: x(coluna), width: LARGURA_DA_COLUNA }}
                    >
                        {etapa.nome}
                    </p>
                ))}
                <svg
                    className="absolute left-0 overflow-visible"
                    style={{ top: ALTURA_DO_TITULO }}
                    width={largura}
                    height={altura}
                    aria-hidden
                >
                    {linhas.map((d, i) => (
                        <path key={i} d={d} className="fill-none stroke-border" strokeWidth={1.5} />
                    ))}
                </svg>
                {etapas.map((etapa, coluna) =>
                    etapa.confrontos.map((confronto, indice) => (
                        <Cartao
                            key={`${etapa.rodada}-${confronto.jogo}`}
                            confronto={confronto}
                            idCompeticao={idCompeticao}
                            className="absolute"
                            style={{
                                left: x(coluna),
                                top: ALTURA_DO_TITULO + y(coluna, indice) - ALTURA_DO_CARTAO / 2,
                                width: LARGURA_DA_COLUNA,
                                height: ALTURA_DO_CARTAO - 6,
                            }}
                        />
                    )),
                )}
            </div>
            {campeao && (
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
                    <Trophy className="size-4 text-warning" />
                    Campeão: {campeao.nomeEquipe}
                </p>
            )}
        </div>
    );
};

/**
 * A eliminatória como chave. Até as oitavas (16 equipes) ela é desenhada; as
 * etapas maiores — 16 avos, 32 avos — viram uma lista de confrontos por
 * etapa, com páginas, como fazem os jogos de futebol: desenhadas, não
 * caberiam numa tela.
 */
export const ChaveDaEliminatoria = ({
    chave,
    idCompeticao,
}: {
    chave: Chaveamento;
    idCompeticao: number;
}) => {
    const emLista = chave.etapas.filter((etapa) => etapa.equipes > EQUIPES_NO_DESENHO);
    const desenhadas = chave.etapas.filter((etapa) => etapa.equipes <= EQUIPES_NO_DESENHO);
    // As páginas: cada etapa grande, e por último a chave desenhada.
    const paginas = [...emLista.map((etapa) => etapa.nome), ...(desenhadas.length ? ["Chave"] : [])];

    // Abre na etapa em andamento: a primeira com confronto ainda aberto.
    const emAndamento = emLista.findIndex((etapa) =>
        etapa.confrontos.some((confronto) => !confronto.decidido),
    );
    const [pagina, setPagina] = useState(emAndamento >= 0 ? emAndamento : paginas.length - 1);

    if (chave.etapas.length === 0) return null;

    const etapaEmLista = pagina < emLista.length ? emLista[pagina] : null;

    return (
        <div className="space-y-4">
            {paginas.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Etapa anterior"
                        disabled={pagina === 0}
                        onClick={() => setPagina((atual) => atual - 1)}
                    >
                        <ChevronLeft />
                    </Button>
                    <div className="flex flex-wrap gap-1">
                        {paginas.map((nome, i) => (
                            <button
                                key={nome}
                                type="button"
                                aria-pressed={i === pagina}
                                onClick={() => setPagina(i)}
                                className={cn(
                                    "h-8 rounded-3xl border px-3 text-sm transition-colors",
                                    i === pagina
                                        ? "border-primary/40 bg-accent/60 font-medium"
                                        : "border-border text-muted-foreground hover:border-ring",
                                )}
                            >
                                {nome === "Chave" ? `${desenhadas[0].nome} em diante` : nome}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Próxima etapa"
                        disabled={pagina === paginas.length - 1}
                        onClick={() => setPagina((atual) => atual + 1)}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            )}

            {etapaEmLista ? (
                <div className="space-y-2">
                    <p className="px-1 text-xs text-muted-foreground">
                        {etapaEmLista.nome} · {etapaEmLista.confrontos.length} confrontos · a chave é
                        desenhada a partir das {desenhadas[0]?.nome.toLowerCase() ?? "oitavas"}.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {[...etapaEmLista.confrontos]
                            .sort((a, b) => a.jogo - b.jogo)
                            .map((confronto) => (
                                <div key={confronto.jogo} className="space-y-1">
                                    <p className="px-1 text-xs text-muted-foreground">Jogo {confronto.jogo}</p>
                                    <Cartao confronto={confronto} idCompeticao={idCompeticao} />
                                </div>
                            ))}
                    </div>
                </div>
            ) : (
                desenhadas.length > 0 && <Desenho etapas={desenhadas} idCompeticao={idCompeticao} />
            )}
        </div>
    );
};
