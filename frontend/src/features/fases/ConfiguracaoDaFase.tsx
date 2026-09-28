"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import {
    AtributoDeFase,
    definirAtributoDaFase,
    listarAtributosDaFase,
} from "@/src/lib/api/fases";
import { useAvisos } from "@/src/lib/avisos";

/**
 * O formulário de configuração da fase, montado a partir do catálogo que o
 * servidor declara.
 *
 * Nada aqui sabe que existe eliminatória ou fase de grupos: cada estratégia
 * do servidor publica os seus campos em `GET /fase/{id}/atributo`, com tipo,
 * obrigatoriedade, valor padrão e descrição, e esta tela desenha um controle
 * por tipo. Escrever os campos à mão por formato seria manter duas listas — e
 * a estratégia nova do servidor não apareceria aqui sem alguém lembrar.
 */

/** O que mostrar no campo, a partir do que o servidor guardou. */
const paraCampo = (atributo: AtributoDeFase) => {
    const bruto = atributo.valor ?? atributo.valorPadrao ?? "";

    // Lista chega junta ("SALDO_GOLS,GOLS_PRO") e fica ilegível sem respiro.
    return atributo.tipoDado === "LISTA_DE_TEXTO"
        ? bruto
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .join(", ")
        : bruto;
};

/** O que gravar, a partir do que a pessoa digitou. */
const paraServidor = (atributo: AtributoDeFase, texto: string) =>
    atributo.tipoDado === "LISTA_DE_TEXTO"
        ? texto
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .join(",")
        : texto.trim();

const CampoDoAtributo = ({
    atributo,
    valor,
    aoMudar,
}: {
    atributo: AtributoDeFase;
    valor: string;
    aoMudar: (valor: string) => void;
}) => {
    const id = `atributo-${atributo.codigo}`;

    if (atributo.tipoDado === "BOOLEANO") {
        return (
            <ToggleGroup
                value={[valor === "true" ? "true" : "false"]}
                onValueChange={(escolhido) => escolhido.length > 0 && aoMudar(escolhido[0])}
                spacing={0}
                variant="outline"
                aria-labelledby={id}
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
                type="number"
                step={atributo.tipoDado === "INTEIRO" ? 1 : "any"}
                className="numero-tabular font-mono"
                value={valor}
                placeholder={atributo.valorPadrao}
                onChange={(evento) => aoMudar(evento.target.value)}
                required={atributo.obrigatorio}
            />
        );
    }

    // TEXTO, LISTA_DE_TEXTO e qualquer tipo que o servidor passe a declarar:
    // um campo de texto sempre aceita o valor, e a fase não fica sem
    // configuração só porque a tela não conhece o tipo ainda.
    return (
        <Input
            id={id}
            value={valor}
            placeholder={
                atributo.tipoDado === "LISTA_DE_TEXTO"
                    ? "Valores separados por vírgula"
                    : atributo.valorPadrao
            }
            onChange={(evento) => aoMudar(evento.target.value)}
            required={atributo.obrigatorio}
        />
    );
};

export const ConfiguracaoDaFase = ({
    idFase,
    aoGravar,
}: {
    idFase: number;
    /** Configuração mudou: a validação da fase precisa ser refeita. */
    aoGravar?: () => void;
}) => {
    const avisos = useAvisos();

    const [atributos, setAtributos] = useState<AtributoDeFase[]>([]);
    const [rascunho, setRascunho] = useState<Record<string, string>>({});
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    const assentar = useCallback((catalogo: AtributoDeFase[]) => {
        setAtributos(catalogo);
        setRascunho(Object.fromEntries(catalogo.map((a) => [a.codigo, paraCampo(a)])));
    }, []);

    const carregar = useCallback(() => {
        setCarregando(true);
        setErro(null);
        listarAtributosDaFase(idFase)
            .then(assentar)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idFase, assentar]);

    useEffect(carregar, [carregar]);

    const alterados = atributos.filter(
        (atributo) => (rascunho[atributo.codigo] ?? "") !== paraCampo(atributo),
    );

    const gravar = async () => {
        setSalvando(true);
        try {
            let ultimo = atributos;
            // Uma chamada por campo: a rota grava um código por vez, e enviar
            // só os alterados evita reescrever o que ninguém tocou.
            for (const atributo of alterados) {
                ultimo = await definirAtributoDaFase(
                    idFase,
                    atributo.codigo,
                    paraServidor(atributo, rascunho[atributo.codigo] ?? ""),
                );
            }
            assentar(ultimo);
            avisos.sucesso("Configuração da fase gravada.");
            aoGravar?.();
        } catch (causa) {
            avisos.erro(causa);
            // O que o servidor aceitou fica; o resto volta ao valor dele.
            carregar();
        } finally {
            setSalvando(false);
        }
    };

    if (erro) return <Erro causa={erro} aoTentarDeNovo={carregar} />;
    if (carregando) return <CarregandoLista linhas={3} />;

    if (atributos.length === 0) {
        return (
            <Vazio
                conceito="fase"
                titulo="Este formato não tem configuração"
                descricao="A estratégia deste formato não declara nenhum campo ajustável."
            />
        );
    }

    return (
        <div className="space-y-4 rounded-3xl border border-border bg-card px-5 py-4">
            {atributos.map((atributo) => (
                <div key={atributo.codigo} className="flex flex-col gap-1.5">
                    <Label id={`atributo-${atributo.codigo}`} htmlFor={`atributo-${atributo.codigo}`}>
                        {atributo.codigo}
                        {atributo.obrigatorio && (
                            <span className="text-destructive" aria-label="obrigatório">
                                {" "}
                                *
                            </span>
                        )}
                    </Label>
                    {atributo.descricao && (
                        <p className="text-xs text-muted-foreground">{atributo.descricao}</p>
                    )}
                    <CampoDoAtributo
                        atributo={atributo}
                        valor={rascunho[atributo.codigo] ?? ""}
                        aoMudar={(valor) =>
                            setRascunho((anterior) => ({ ...anterior, [atributo.codigo]: valor }))
                        }
                    />
                </div>
            ))}

            <div className="flex items-center justify-end gap-3 pt-1">
                {alterados.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {alterados.length === 1
                            ? "1 campo alterado"
                            : `${alterados.length} campos alterados`}
                    </p>
                )}
                <Button size="sm" onClick={gravar} disabled={salvando || alterados.length === 0}>
                    {salvando ? "Gravando…" : "Gravar configuração"}
                </Button>
            </div>
        </div>
    );
};
