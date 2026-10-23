"use client";

import { ChevronDown, Plus, X } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
    AtributoDeFase,
    CRITERIOS_DE_DESEMPATE,
    rotuloDoAtributo,
} from "@/src/lib/api/fases";

/**
 * Os campos de configuração de uma fase, montados a partir do que a
 * estratégia do servidor declara: nada aqui sabe que existe eliminatória ou
 * fase de grupos. Servem ao diálogo de criar e editar fase e ao painel da
 * página de fases.
 */

const CRITERIOS = "criteriosDeDesempate";

/** O que mostrar no campo, a partir do que o servidor guardou. */
export const paraCampo = (atributo: AtributoDeFase) => {
    const bruto = atributo.valor ?? atributo.valorPadrao ?? "";
    if (atributo.tipoDado !== "LISTA_DE_TEXTO") return bruto;

    const itens = bruto
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    return atributo.codigo === CRITERIOS ? itens.join(",") : itens.join(", ");
};

/** O que gravar, a partir do que a pessoa preencheu. */
export const paraServidor = (atributo: AtributoDeFase, texto: string) =>
    atributo.tipoDado === "LISTA_DE_TEXTO"
        ? texto
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .join(",")
        : texto.trim();

/**
 * Sem valor padrão e sem ser obrigatório é o atributo que a estratégia
 * precisa mas aceita de mais de um jeito — o número de grupos ou o tamanho
 * deles. São esses que a pessoa tem que ver primeiro.
 */
export const pedeEscolha = (atributo: AtributoDeFase) =>
    !atributo.obrigatorio && atributo.valorPadrao === undefined;

/**
 * O que falta antes de mandar para o servidor: obrigatório vazio, e — quando
 * há mais de um campo de escolha — nenhum ou mais de um preenchido. O
 * servidor revalida; isto só evita a viagem de ida e volta para descobrir.
 */
export const pendenciasDosCampos = (
    atributos: AtributoDeFase[],
    rascunho: Record<string, string>,
): string[] => {
    const preenchido = (a: AtributoDeFase) => (rascunho[a.codigo] ?? "").trim() !== "";
    const pendencias = atributos
        .filter((a) => a.obrigatorio && !preenchido(a))
        .map((a) => `Preencha ${rotuloDoAtributo(a.codigo).toLowerCase()}.`);

    const escolhas = atributos.filter(pedeEscolha);
    const preenchidas = escolhas.filter(preenchido);
    if (escolhas.length > 1 && preenchidas.length !== 1) {
        const nomes = escolhas.map((a) => rotuloDoAtributo(a.codigo).toLowerCase()).join(" ou ");
        pendencias.push(
            preenchidas.length === 0 ? `Informe ${nomes}.` : `Informe só um: ${nomes}.`,
        );
    }
    return pendencias;
};

const OrdemDosCriterios = ({
    valor,
    aoMudar,
    editavel,
}: {
    valor: string;
    aoMudar: (valor: string) => void;
    editavel: boolean;
}) => {
    const escolhidos = valor.split(",").filter(Boolean);
    const rotulo = (codigo: string) =>
        CRITERIOS_DE_DESEMPATE.find((c) => c.codigo === codigo)?.rotulo ?? codigo;
    const restantes = CRITERIOS_DE_DESEMPATE.filter((c) => !escolhidos.includes(c.codigo));

    return (
        <div className="space-y-2">
            <ol className="flex flex-wrap gap-1.5">
                {escolhidos.map((codigo, i) => (
                    <li
                        key={codigo}
                        className="flex items-center gap-1.5 rounded-3xl bg-secondary py-1 pr-1 pl-2.5 text-xs text-secondary-foreground"
                    >
                        <span className="numero-tabular font-mono text-muted-foreground">
                            {i + 1}º
                        </span>
                        {rotulo(codigo)}
                        {editavel && (
                            <button
                                type="button"
                                onClick={() =>
                                    aoMudar(escolhidos.filter((c) => c !== codigo).join(","))
                                }
                                aria-label={`Tirar ${rotulo(codigo)}`}
                                className="rounded-full p-0.5 hover:bg-muted"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </li>
                ))}
                {escolhidos.length === 0 && (
                    <li className="text-xs text-muted-foreground">Só os pontos decidem.</li>
                )}
            </ol>
            {editavel && restantes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {restantes.map((criterio) => (
                        <button
                            key={criterio.codigo}
                            type="button"
                            onClick={() => aoMudar([...escolhidos, criterio.codigo].join(","))}
                            className="flex items-center gap-1 rounded-3xl border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
                        >
                            <Plus className="size-3" />
                            {criterio.rotulo}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CampoDoAtributo = ({
    id,
    atributo,
    valor,
    aoMudar,
    editavel,
}: {
    id: string;
    atributo: AtributoDeFase;
    valor: string;
    aoMudar: (valor: string) => void;
    editavel: boolean;
}) => {

    if (atributo.codigo === CRITERIOS) {
        return <OrdemDosCriterios valor={valor} aoMudar={aoMudar} editavel={editavel} />;
    }

    if (atributo.tipoDado === "BOOLEANO") {
        return (
            <ToggleGroup
                value={[valor === "true" ? "true" : "false"]}
                onValueChange={(escolhido) =>
                    editavel && escolhido.length > 0 && aoMudar(escolhido[0])
                }
                variant="outline"
                disabled={!editavel}
                aria-labelledby={`${id}-rotulo`}
            >
                <ToggleGroupItem value="true">Sim</ToggleGroupItem>
                <ToggleGroupItem value="false">Não</ToggleGroupItem>
            </ToggleGroup>
        );
    }

    if (atributo.tipoDado === "INTEIRO" || atributo.tipoDado === "DECIMAL") {
        return (
            <Input
                id={id}
                name={atributo.codigo}
                type="number"
                min={0}
                step={atributo.tipoDado === "INTEIRO" ? 1 : "any"}
                className="numero-tabular font-mono"
                value={valor}
                placeholder={atributo.valorPadrao ?? "—"}
                onChange={(evento) => aoMudar(evento.target.value)}
                disabled={!editavel}
            />
        );
    }

    // Qualquer tipo que o servidor passe a declarar cai num campo de texto:
    // a fase não fica sem configuração só porque a tela não o conhece ainda.
    return (
        <Input
            id={id}
            name={atributo.codigo}
            value={valor}
            placeholder={
                atributo.tipoDado === "LISTA_DE_TEXTO"
                    ? "Valores separados por vírgula"
                    : atributo.valorPadrao
            }
            onChange={(evento) => aoMudar(evento.target.value)}
            disabled={!editavel}
        />
    );
};

const Campo = ({
    prefixo,
    atributo,
    rascunho,
    aoMudar,
    editavel,
}: {
    prefixo: string;
    atributo: AtributoDeFase;
    rascunho: Record<string, string>;
    aoMudar: (codigo: string, valor: string) => void;
    editavel: boolean;
}) => (
    <div className="flex flex-col gap-1.5">
        <Label id={`${prefixo}-${atributo.codigo}-rotulo`} htmlFor={`${prefixo}-${atributo.codigo}`}>
            {rotuloDoAtributo(atributo.codigo)}
            {atributo.obrigatorio && (
                <span className="text-destructive" aria-label="obrigatório">
                    *
                </span>
            )}
        </Label>
        {atributo.descricao && (
            <p className="text-xs text-muted-foreground">{atributo.descricao}</p>
        )}
        <CampoDoAtributo
            id={`${prefixo}-${atributo.codigo}`}
            atributo={atributo}
            editavel={editavel}
            valor={rascunho[atributo.codigo] ?? ""}
            aoMudar={(valor) => aoMudar(atributo.codigo, valor)}
        />
    </div>
);

/**
 * Primeiro o que a fase precisa para ser montada; depois as regras, que já
 * vêm com o valor padrão e ficam recolhidas para não esconder o essencial.
 */
export const CamposDaFase = ({
    atributos,
    rascunho,
    aoMudar,
    editavel = true,
    regrasAbertas = false,
    depoisDoEssencial,
}: {
    atributos: AtributoDeFase[];
    rascunho: Record<string, string>;
    aoMudar: (codigo: string, valor: string) => void;
    editavel?: boolean;
    regrasAbertas?: boolean;
    /** O que a tela quer mostrar junto do essencial, antes das regras recolhidas. */
    depoisDoEssencial?: React.ReactNode;
}) => {
    // O painel da página e o diálogo podem estar na tela juntos: id fixo
    // fazia cada rótulo apontar para dois campos.
    const prefixo = useId();
    const essenciais = atributos.filter((a) => a.obrigatorio || pedeEscolha(a));
    const regras = atributos.filter((a) => !essenciais.includes(a));
    const variasEscolhas = essenciais.filter(pedeEscolha).length > 1;

    return (
        <div className="space-y-4">
            {essenciais.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-primary/30 bg-accent/40 p-4">
                    <p className="text-sm font-medium">
                        {variasEscolhas ? "Como dividir — preencha um dos dois" : "Para montar a fase"}
                    </p>
                    <div className={cn("grid gap-4", essenciais.length > 1 && "sm:grid-cols-2")}>
                        {essenciais.map((atributo) => (
                            <Campo
                                key={atributo.codigo}
                                prefixo={prefixo}
                                atributo={atributo}
                                rascunho={rascunho}
                                aoMudar={aoMudar}
                                editavel={editavel}
                            />
                        ))}
                    </div>
                </div>
            )}

            {depoisDoEssencial}

            {regras.length > 0 && (
                <details open={regrasAbertas} className="group rounded-2xl border border-border">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                        <span>
                            Regras
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                pontuação, desempate, ida e volta — já com o padrão
                            </span>
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="grid gap-4 border-t border-border px-4 py-4 sm:grid-cols-2">
                        {regras.map((atributo) => (
                            <div
                                key={atributo.codigo}
                                className={cn(atributo.tipoDado === "LISTA_DE_TEXTO" && "sm:col-span-2")}
                            >
                                <Campo
                                    prefixo={prefixo}
                                    atributo={atributo}
                                    rascunho={rascunho}
                                    aoMudar={aoMudar}
                                    editavel={editavel}
                                />
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
};
