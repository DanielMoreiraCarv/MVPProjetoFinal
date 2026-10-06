"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Escolha } from "@/src/components/Escolha";
import { CarregandoTabela, Erro, Vazio } from "@/src/components/estado/Estados";
import { Secao } from "@/src/components/layout/Secao";
import { TabelasPorGrupo } from "@/src/features/campeonatos/TabelasPorGrupo";
import { ChaveDaEliminatoria } from "@/src/features/fases/ChaveDaEliminatoria";
import {
    Chaveamento,
    Fase,
    LinhaDaTabela,
    ROTULO_DO_FORMATO,
    buscarChaveamento,
    listarFasesDaCompeticao,
    listarTabelaDaFase,
    temTabelaDePontos,
} from "@/src/lib/api/fases";

const porOrdem = (a: Fase, b: Fase) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id;

/**
 * A classificação da competição, fase a fase. É o mesmo componente na visão
 * geral e na página de classificação: antes eram dois, a visão geral lia um
 * formato antigo da competição e mostrava tabela para uma estrutura de
 * mata-mata, enquanto a outra página, que lia as fases, não mostrava nada.
 *
 * Fase de pontos — grupos e pontos corridos — é tabela, um grupo por vez e
 * com todo mundo zerado desde o início. Eliminatória é chave.
 */
export const ClassificacaoPorFase = ({ idCompeticao }: { idCompeticao: number }) => {
    const [fases, setFases] = useState<Fase[]>([]);
    const [escolhida, setEscolhida] = useState("");
    const [tabela, setTabela] = useState<LinhaDaTabela[]>([]);
    const [chave, setChave] = useState<Chaveamento | null>(null);
    const [carregandoFases, setCarregandoFases] = useState(true);
    const [carregandoFase, setCarregandoFase] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    const carregarFases = useCallback(() => {
        if (!Number.isFinite(idCompeticao)) return;
        setCarregandoFases(true);
        setErro(null);
        listarFasesDaCompeticao(idCompeticao)
            .then((lista) => {
                const emOrdem = [...lista].sort(porOrdem);
                setFases(emOrdem);
                setEscolhida((anterior) =>
                    anterior && emOrdem.some((fase) => String(fase.id) === anterior)
                        ? anterior
                        : emOrdem.length > 0
                          ? String(emOrdem[0].id)
                          : "",
                );
            })
            .catch(setErro)
            .finally(() => setCarregandoFases(false));
    }, [idCompeticao]);

    useEffect(carregarFases, [carregarFases]);

    const fase = useMemo(() => fases.find((cada) => String(cada.id) === escolhida) ?? null, [fases, escolhida]);
    const porPontos = temTabelaDePontos(fase?.formato);
    const anterior = fase ? fases.find((cada) => cada.idFaseSucessora === fase.id) : undefined;

    const carregarFase = useCallback(() => {
        if (!fase) return;
        setCarregandoFase(true);
        setErro(null);
        const busca = temTabelaDePontos(fase.formato)
            ? listarTabelaDaFase(fase.id).then((linhas) => {
                  setTabela(linhas);
                  setChave(null);
              })
            : buscarChaveamento(fase.id).then((chaveDaFase) => {
                  setChave(chaveDaFase);
                  setTabela([]);
              });
        busca.catch(setErro).finally(() => setCarregandoFase(false));
    }, [fase]);

    useEffect(carregarFase, [carregarFase]);

    if (erro) return <Erro causa={erro} aoTentarDeNovo={fase ? carregarFase : carregarFases} />;
    if (carregandoFases) return <CarregandoTabela linhas={8} colunas={4} />;

    if (fases.length === 0) {
        return (
            <Vazio
                conceito="fase"
                titulo="A competição ainda não tem fases"
                descricao="A classificação sai das fases: monte a estrutura — grupos, pontos corridos, eliminatória — e ela aparece aqui."
                acao={
                    <Button
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/competicao/${idCompeticao}/estrutura`} />}
                    >
                        Ir para a Estrutura
                    </Button>
                }
            />
        );
    }

    const ninguemJogou = tabela.every((linha) => linha.jogos === 0);
    const gruposAindaNaoSorteados =
        fase?.formato === "GRUPOS" && tabela.every((linha) => linha.grupo === undefined);
    const aguardando = (
        <Vazio
            conceito="classificacao"
            titulo={anterior ? `Aguardando ${anterior.nome}` : "Nenhuma equipe entra nesta fase"}
            descricao={
                anterior
                    ? `As equipes desta fase são os classificados de ${anterior.nome}, e aparecem aqui quando ela tiver classificação.`
                    : "Inscreva as equipes na competição para a fase começar."
            }
        />
    );

    return (
        <Secao
            titulo={fase?.nome ?? "Classificação"}
            descricao={
                fase?.formato
                    ? `${ROTULO_DO_FORMATO[fase.formato]}${fase.classificados ? ` · ${fase.classificados} avançam` : ""}`
                    : undefined
            }
            acao={
                <Escolha
                    valor={escolhida}
                    aoMudar={setEscolhida}
                    className="w-56"
                    opcoes={fases.map((cada, i) => ({
                        valor: String(cada.id),
                        rotulo: `${i + 1}. ${cada.nome}`,
                    }))}
                />
            }
        >
            {carregandoFase ? (
                <CarregandoTabela linhas={8} colunas={porPontos ? 10 : 2} />
            ) : porPontos ? (
                tabela.length === 0 ? (
                    aguardando
                ) : (
                    <div className="space-y-4">
                        {(gruposAindaNaoSorteados || ninguemJogou) && (
                            <p className="px-1 text-xs text-muted-foreground">
                                {gruposAindaNaoSorteados
                                    ? `Os grupos saem quando os confrontos forem gerados. Até lá, a tabela lista as ${tabela.length} equipes que entram na fase, todas zeradas.`
                                    : "Ninguém jogou ainda: todas as equipes começam zeradas."}
                            </p>
                        )}
                        <TabelasPorGrupo linhas={tabela} />
                    </div>
                )
            ) : chave && chave.etapas.length > 0 ? (
                <div className="space-y-3">
                    {anterior &&
                        chave.etapas[0].confrontos.every((confronto) => !confronto.mandante.idEquipe) && (
                            <p className="px-1 text-xs text-muted-foreground">
                                As {chave.participantes} equipes desta chave saem de {anterior.nome}, e
                                entram quando todos os jogos dela forem encerrados.
                            </p>
                        )}
                    <ChaveDaEliminatoria key={fase?.id} chave={chave} idCompeticao={idCompeticao} />
                </div>
            ) : chave && chave.participantes >= 2 ? (
                <Vazio
                    conceito="chaveamento"
                    titulo="Essa quantidade não fecha uma chave"
                    descricao={`${chave.participantes} equipes não chegam a ${chave.pararEm} eliminando metade a cada rodada. Ajuste a fase em Fases.`}
                />
            ) : (
                aguardando
            )}
        </Secao>
    );
};
