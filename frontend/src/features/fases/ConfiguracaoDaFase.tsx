"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CamposDaFase, paraCampo, paraServidor } from "@/src/features/fases/CamposDaFase";
import { POR_GRUPO, QuemAvanca, pendenciasDeQuemAvanca } from "@/src/features/fases/QuemAvanca";
import {
    AtributoDeFase,
    Fase,
    atualizarFase,
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
    fase,
    idCompeticao,
    editavel = true,
    aoGravar,
}: {
    idFase: number;
    /**
     * A fase inteira, quando a tela a tem: na fase de grupos, o "quem avança"
     * mexe no total da fase além do atributo, e grava os dois juntos.
     */
    fase?: Fase;
    idCompeticao?: number;
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
    const [total, setTotal] = useState(fase?.classificados ? String(fase.classificados) : "");
    const deGrupos = fase?.formato === "GRUPOS" && idCompeticao !== undefined;

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
    const totalMudou = deGrupos && total !== (fase?.classificados ? String(fase.classificados) : "");
    const quantasMudancas = alterados.length + (totalMudou ? 1 : 0);
    const pendencias = deGrupos ? pendenciasDeQuemAvanca(fase?.entram ?? 0, rascunho, total) : [];

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
            if (totalMudou && fase?.formato && idCompeticao !== undefined) {
                await atualizarFase(fase.id, {
                    nome: fase.nome,
                    ordem: fase.ordem ?? 1,
                    fasePartida: fase.formato,
                    idCompeticao,
                    qtdClassificados: total ? Number(total) : undefined,
                    idFaseSucessora: fase.idFaseSucessora,
                });
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
                atributos={deGrupos ? atributos.filter((a) => a.codigo !== POR_GRUPO) : atributos}
                depoisDoEssencial={
                    deGrupos && (
                        <QuemAvanca
                            entram={fase?.entram ?? 0}
                            rascunho={rascunho}
                            aoMudarPorGrupo={(valor) =>
                                setRascunho((anterior) => ({ ...anterior, [POR_GRUPO]: valor }))
                            }
                            total={total}
                            aoMudarTotal={setTotal}
                            editavel={editavel}
                        />
                    )
                }
                rascunho={rascunho}
                editavel={editavel}
                aoMudar={(codigo, valor) =>
                    setRascunho((anterior) => ({ ...anterior, [codigo]: valor }))
                }
            />

            {editavel && (
            <div className="flex items-center justify-end gap-3 pt-1">
                {pendencias.length > 0 ? (
                    <p role="alert" className="text-xs text-destructive">
                        {pendencias[0]}
                    </p>
                ) : (
                    quantasMudancas > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {quantasMudancas === 1
                                ? "1 campo alterado"
                                : `${quantasMudancas} campos alterados`}
                        </p>
                    )
                )}
                <Button
                    size="sm"
                    onClick={gravar}
                    disabled={salvando || quantasMudancas === 0 || pendencias.length > 0}
                >
                    {salvando ? "Gravando…" : "Gravar configuração"}
                </Button>
            </div>
            )}
        </div>
    );
};
