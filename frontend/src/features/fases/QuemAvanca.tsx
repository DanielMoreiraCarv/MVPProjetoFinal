"use client";

import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CRITERIOS_DE_DESEMPATE } from "@/src/lib/api/fases";

/** O atributo da fase de grupos; o total é o `qtdClassificados` da fase. */
export const POR_GRUPO = "classificadosPorGrupo";

const ordinal = (n: number) => `${n}º`;

/** "1º", "1º e 2º", "1º, 2º e 3º". */
const colocacoes = (ate: number) => {
    const lista = Array.from({ length: ate }, (_, i) => ordinal(i + 1));
    return lista.length <= 1 ? lista.join("") : `${lista.slice(0, -1).join(", ")} e ${lista[lista.length - 1]}`;
};

const ehPotenciaDeDois = (n: number) => n > 0 && (n & (n - 1)) === 0;

/**
 * Quem avança, numa frase. O servidor ordena a classificação da fase de
 * grupos por colocação — os primeiros, depois os segundos — e corta no total,
 * então um total menor que grupos × por grupo leva os primeiros e os melhores
 * segundos; maior, os melhores terceiros.
 */
const frase = (grupos: number, total: number) => {
    const completas = Math.floor(total / grupos);
    const resto = total % grupos;
    const partes = [];
    if (completas > 0) {
        partes.push(
            grupos === 1
                ? completas === 1
                    ? "o primeiro"
                    : `os ${completas} primeiros`
                : `${completas === 1 ? "o 1º" : `os ${colocacoes(completas)}`} de cada grupo`,
        );
    }
    if (resto > 0) {
        partes.push(`${resto === 1 ? "o melhor" : `os ${resto} melhores`} ${ordinal(completas + 1)} colocados`);
    }
    return partes.join(" e ");
};

/** A conta de quem avança, a partir do que está preenchido. */
export const contaDeQuemAvanca = (entram: number, rascunho: Record<string, string>, total: string) => {
    const inteiro = (codigo: string) => Number.parseInt(rascunho[codigo] ?? "", 10);
    const quantosGrupos =
        inteiro("numeroDeGrupos") > 0
            ? inteiro("numeroDeGrupos")
            : inteiro("tamanhoDoGrupo") > 0
              ? Math.ceil(entram / inteiro("tamanhoDoGrupo"))
              : 0;
    const porGrupo = Number.parseInt(rascunho[POR_GRUPO] || "2", 10);
    const menorGrupo = quantosGrupos > 0 ? Math.floor(entram / quantosGrupos) : 0;
    const calculado = quantosGrupos * porGrupo;
    const totalQueAvanca = total ? Number(total) : calculado;
    return { quantosGrupos, porGrupo, menorGrupo, calculado, totalQueAvanca };
};

/** O que impede salvar: o servidor revalida, isto evita a viagem. */
export const pendenciasDeQuemAvanca = (entram: number, rascunho: Record<string, string>, total: string) => {
    const { quantosGrupos, porGrupo, menorGrupo, totalQueAvanca } = contaDeQuemAvanca(entram, rascunho, total);
    const pendencias: string[] = [];
    if (quantosGrupos > 0 && porGrupo < 1) pendencias.push("Avança ao menos uma equipe por grupo.");
    if (quantosGrupos > 0 && porGrupo > menorGrupo) {
        pendencias.push(`Avançam ${porGrupo} por grupo, mas o menor grupo tem ${menorGrupo} equipes.`);
    }
    if (total && totalQueAvanca > entram) {
        pendencias.push(`Avançam ${totalQueAvanca}, mas entram só ${entram} equipes nesta fase.`);
    }
    return pendencias;
};

/**
 * Quem avança da fase de grupos. A pergunta é por grupo — é como quem monta
 * pensa: os dois primeiros de cada um —, e o total sai calculado embaixo.
 * Mudar o total é a exceção — levar só os melhores segundos, ou os melhores
 * terceiros —, e fica atrás de um clique para ninguém preencher os dois sem
 * querer. É o mesmo bloco no diálogo de fase, na página de fases e na
 * Estrutura.
 */
export const QuemAvanca = ({
    entram,
    rascunho,
    aoMudarPorGrupo,
    total,
    aoMudarTotal,
    editavel = true,
}: {
    entram: number;
    /** Os atributos da fase: número ou tamanho dos grupos, por grupo, critérios. */
    rascunho: Record<string, string>;
    aoMudarPorGrupo: (valor: string) => void;
    /** O total informado à mão; vazio é "o calculado". */
    total: string;
    aoMudarTotal: (valor: string) => void;
    editavel?: boolean;
}) => {
    const id = useId();
    const [ajustando, setAjustando] = useState(total !== "");
    const { quantosGrupos, porGrupo, menorGrupo, calculado, totalQueAvanca } = contaDeQuemAvanca(
        entram,
        rascunho,
        total,
    );
    const criterios = (rascunho.criteriosDeDesempate ?? "")
        .split(",")
        .filter(Boolean)
        .map((codigo) => CRITERIOS_DE_DESEMPATE.find((c) => c.codigo === codigo)?.rotulo.toLowerCase() ?? codigo);

    return (
        <div className="space-y-3 rounded-2xl border border-border p-4">
            <div className="flex flex-col gap-1.5 sm:max-w-56">
                <Label htmlFor={`${id}-por-grupo`}>Avançam por grupo</Label>
                <Input
                    id={`${id}-por-grupo`}
                    name="classificadosPorGrupo"
                    type="number"
                    min={1}
                    className="numero-tabular font-mono"
                    value={rascunho[POR_GRUPO] ?? "2"}
                    onChange={(evento) => aoMudarPorGrupo(evento.target.value)}
                    disabled={!editavel}
                    aria-invalid={quantosGrupos > 0 && (porGrupo < 1 || porGrupo > menorGrupo)}
                />
            </div>

            {quantosGrupos === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Informe como dividir os grupos para ver quantas equipes avançam.
                </p>
            ) : (
                <div className="space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                    {totalQueAvanca > 0 && totalQueAvanca <= entram && (
                        <p className="text-sm text-foreground">
                            <span className="numero-tabular font-mono font-semibold">{totalQueAvanca}</span>{" "}
                            {totalQueAvanca === 1 ? "equipe vai avançar" : "equipes vão avançar"}:{" "}
                            {frase(quantosGrupos, totalQueAvanca)}.
                        </p>
                    )}

                    {editavel &&
                        (!ajustando ? (
                            <button
                                type="button"
                                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                                onClick={() => {
                                    setAjustando(true);
                                    aoMudarTotal(String(calculado));
                                }}
                            >
                                Ajustar o total — para levar só os melhores segundos, ou os melhores terceiros
                            </button>
                        ) : (
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor={`${id}-total`}>Total que avança</Label>
                                    <Input
                                        id={`${id}-total`}
                                        name="totalQueAvanca"
                                        type="number"
                                        min={1}
                                        className="numero-tabular w-32 font-mono"
                                        value={total}
                                        onChange={(evento) => aoMudarTotal(evento.target.value)}
                                        aria-invalid={!!total && totalQueAvanca > entram}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="pb-2 font-medium text-foreground underline underline-offset-4 hover:text-primary"
                                    onClick={() => {
                                        setAjustando(false);
                                        aoMudarTotal("");
                                    }}
                                >
                                    Voltar a {calculado} ({quantosGrupos} grupos × {porGrupo})
                                </button>
                            </div>
                        ))}

                    {totalQueAvanca % quantosGrupos !== 0 && totalQueAvanca <= entram && (
                        <p>
                            Entre grupos diferentes, os {ordinal(Math.floor(totalQueAvanca / quantosGrupos) + 1)}{" "}
                            colocados são comparados por pontos
                            {criterios.length > 0 ? `, depois ${criterios.join(", ")}` : ""}.
                        </p>
                    )}
                    {!ehPotenciaDeDois(totalQueAvanca) && (
                        <p>
                            Se a fase seguinte for eliminatória, o total precisa fechar uma chave: 2, 4, 8, 16,
                            32…
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
