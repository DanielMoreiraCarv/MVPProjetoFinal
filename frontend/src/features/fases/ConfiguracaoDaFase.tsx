"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CamposDaFase, paraCampo, paraServidor } from "@/src/features/fases/CamposDaFase";
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

export const ConfiguracaoDaFase = ({
    idFase,
    editavel = true,
    aoGravar,
}: {
    idFase: number;
    /**
     * Falso na competição já publicada: a estrutura vira leitura, porque
     * mexer nela invalidaria confrontos gerados e classificação calculada.
     */
    editavel?: boolean;
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
            <CamposDaFase
                atributos={atributos}
                rascunho={rascunho}
                editavel={editavel}
                aoMudar={(codigo, valor) =>
                    setRascunho((anterior) => ({ ...anterior, [codigo]: valor }))
                }
            />

            {editavel && (
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
            )}
        </div>
    );
};
