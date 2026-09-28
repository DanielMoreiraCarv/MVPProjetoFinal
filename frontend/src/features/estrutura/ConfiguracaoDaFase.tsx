"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Erro } from "@/src/components/estado/Estados";
import {
    AtributoDeFase,
    definirAtributoDaFase,
    listarAtributosDaFase,
} from "@/src/lib/api/fases";
import { useAvisos } from "@/src/lib/avisos";

/**
 * O formulário de configuração de uma fase, montado a partir do que a
 * estratégia do servidor declara.
 *
 * Nenhum campo está escrito aqui. `GET /fase/{id}/atributo` devolve código,
 * tipo de dado, obrigatoriedade, valor padrão e descrição, e este componente
 * escolhe o controle pelo tipo. É o que faz uma estratégia nova no servidor
 * aparecer na tela sozinha — escrever os campos à mão por formato seria manter
 * duas listas que divergem na primeira estratégia adicionada.
 */

const rotulo = (codigo: string) =>
    codigo
        // idaEVolta -> ida E Volta
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letra) => letra.toUpperCase())
        .trim();

const Campo = ({
    atributo,
    valor,
    aoMudar,
    desabilitado,
}: {
    atributo: AtributoDeFase;
    valor: string;
    aoMudar: (valor: string) => void;
    desabilitado: boolean;
}) => {
    const id = `atributo-${atributo.codigo}`;

    if (atributo.tipoDado === "BOOLEANO") {
        return (
            <label
                htmlFor={id}
                className={cn(
                    "flex items-start gap-3 rounded-2xl border border-border p-3",
                    desabilitado ? "opacity-60" : "cursor-pointer hover:border-ring",
                )}
            >
                <input
                    id={id}
                    type="checkbox"
                    checked={valor === "true"}
                    disabled={desabilitado}
                    onChange={(evento) => aoMudar(String(evento.target.checked))}
                    className="mt-0.5 size-4 accent-primary"
                />
                <span className="min-w-0 space-y-0.5">
                    <span className="block text-sm font-medium">{rotulo(atributo.codigo)}</span>
                    {atributo.descricao && (
                        <span className="block text-xs text-muted-foreground">
                            {atributo.descricao}
                        </span>
                    )}
                </span>
            </label>
        );
    }

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>
                {rotulo(atributo.codigo)}
                {atributo.obrigatorio && <span className="text-destructive"> *</span>}
            </Label>
            <Input
                id={id}
                type={
                    atributo.tipoDado === "INTEIRO" || atributo.tipoDado === "DECIMAL"
                        ? "number"
                        : "text"
                }
                step={atributo.tipoDado === "DECIMAL" ? "0.1" : undefined}
                value={valor}
                disabled={desabilitado}
                placeholder={atributo.valorPadrao ?? undefined}
                onChange={(evento) => aoMudar(evento.target.value)}
            />
            {atributo.descricao && (
                <p className="text-xs text-muted-foreground">
                    {atributo.descricao}
                    {atributo.tipoDado === "LISTA_DE_TEXTO" && " Separe por vírgula."}
                </p>
            )}
        </div>
    );
};

export const ConfiguracaoDaFase = ({
    idFase,
    editavel,
    aoMudar,
}: {
    idFase: number;
    editavel: boolean;
    /** Avisa quem contém para revalidar a fase depois de uma mudança. */
    aoMudar?: () => void;
}) => {
    const [atributos, setAtributos] = useState<AtributoDeFase[]>([]);
    const [rascunho, setRascunho] = useState<Record<string, string>>({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);
    const avisos = useAvisos();

    const carregar = () => {
        setCarregando(true);
        setErro(null);
        listarAtributosDaFase(idFase)
            .then((lista) => {
                setAtributos(lista);
                setRascunho(
                    Object.fromEntries(
                        lista.map((a) => [a.codigo, a.valor ?? a.valorPadrao ?? ""]),
                    ),
                );
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, [idFase]);

    // Grava ao sair do campo, e não a cada tecla: uma escrita por caractere
    // faria dezenas de requisições para preencher "3".
    const gravar = async (codigo: string) => {
        const valor = rascunho[codigo] ?? "";
        const original = atributos.find((a) => a.codigo === codigo);

        if ((original?.valor ?? original?.valorPadrao ?? "") === valor) {
            return;
        }

        try {
            const atualizados = await definirAtributoDaFase(idFase, codigo, valor);
            setAtributos(atualizados);
            aoMudar?.();
        } catch (causa) {
            avisos.erro(causa);
            carregar();
        }
    };

    if (erro) {
        return <Erro causa={erro} aoTentarDeNovo={carregar} />;
    }

    if (carregando) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (atributos.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Este formato não tem nada a configurar.
            </p>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {atributos.map((atributo) => (
                <div
                    key={atributo.codigo}
                    onBlur={() => editavel && gravar(atributo.codigo)}
                    className={atributo.tipoDado === "BOOLEANO" ? "sm:col-span-2" : undefined}
                >
                    <Campo
                        atributo={atributo}
                        valor={rascunho[atributo.codigo] ?? ""}
                        desabilitado={!editavel}
                        aoMudar={(valor) => {
                            setRascunho((antes) => ({ ...antes, [atributo.codigo]: valor }));
                            // Interruptor grava na hora: não há "sair do campo".
                            if (editavel && atributo.tipoDado === "BOOLEANO") {
                                definirAtributoDaFase(idFase, atributo.codigo, valor)
                                    .then((atualizados) => {
                                        setAtributos(atualizados);
                                        aoMudar?.();
                                    })
                                    .catch((causa) => {
                                        avisos.erro(causa);
                                        carregar();
                                    });
                            }
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
