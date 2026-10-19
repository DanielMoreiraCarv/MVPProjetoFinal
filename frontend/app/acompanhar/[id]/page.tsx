"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { useCompeticaoAcompanhada } from "@/src/features/acompanhamento/Acompanhamento";
import { IndicadorDeAtualizacao } from "@/src/features/acompanhamento/IndicadorDeAtualizacao";
import { JogosEmLista } from "@/src/features/acompanhamento/JogosEmLista";
import { ListaDeInscritas } from "@/src/features/campeonatos/ListaDeInscritas";
import { ClassificacaoPorFase } from "@/src/features/fases/ClassificacaoPorFase";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { porDataHora } from "@/src/lib/formato";
import { Partida } from "@/src/lib/types/partida";
import { useAtualizacaoPeriodica } from "@/src/lib/useAtualizacaoPeriodica";
import { enderecoPublicoDaCompeticao } from "@/src/lib/visao-publica";

/**
 * O que a torcida quer ver ao abrir o link: o próximo jogo, o último
 * resultado e como está a tabela. No celular os jogos vêm antes da
 * classificação; na mesa ficam ao lado.
 */
const VisaoGeralPublica = () => {
    const competicao = useCompeticaoAcompanhada();
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);
    const [versao, setVersao] = useState(0);

    const buscarPartidas = useCallback(
        () => listarPartidasDaCompeticao(competicao.id, "publico").then(setPartidas),
        [competicao.id],
    );

    const aoVivo = useAtualizacaoPeriodica(
        useCallback(async () => {
            await buscarPartidas();
            setVersao((anterior) => anterior + 1);
        }, [buscarPartidas]),
        { ativa: competicao.estado === "EM_ANDAMENTO" },
    );
    const { marcarComoAtualizado } = aoVivo;

    const carregar = useCallback(() => {
        setCarregando(true);
        setErro(null);
        buscarPartidas()
            .then(marcarComoAtualizado)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [buscarPartidas, marcarComoAtualizado]);

    useEffect(carregar, [carregar]);

    const proximas = useMemo(
        () => partidas.filter((partida) => !partida.realizada).sort(porDataHora).slice(0, 5),
        [partidas],
    );
    const resultados = useMemo(
        () => partidas.filter((partida) => partida.realizada).sort(porDataHora).reverse().slice(0, 5),
        [partidas],
    );
    const todas = `${enderecoPublicoDaCompeticao(competicao.id)}/partida`;

    return (
        <CorpoDaPagina className="space-y-6">
            <IndicadorDeAtualizacao
                className="justify-end"
                atualizadoEm={aoVivo.atualizadoEm}
                atualizando={aoVivo.atualizando}
                falhou={aoVivo.falhou}
                ativa={competicao.estado === "EM_ANDAMENTO"}
                aoAtualizar={aoVivo.atualizarAgora}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="min-w-0 space-y-6 lg:order-2">
                    <Secao
                        titulo="Próximos jogos"
                        acao={
                            partidas.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    nativeButton={false}
                                    render={<Link href={todas} />}
                                >
                                    Todos
                                    <ArrowRight />
                                </Button>
                            )
                        }
                    >
                        {erro ? (
                            <Erro causa={erro} aoTentarDeNovo={carregar} />
                        ) : carregando ? (
                            <CarregandoLista linhas={3} />
                        ) : proximas.length === 0 ? (
                            <Vazio
                                conceito="partida"
                                titulo="Nenhum jogo pela frente"
                                descricao={
                                    partidas.length > 0
                                        ? "Todos os jogos desta fase já foram disputados."
                                        : "Os jogos aparecem aqui quando a organização montar a tabela."
                                }
                            />
                        ) : (
                            <JogosEmLista partidas={proximas} idCompeticao={competicao.id} />
                        )}
                    </Secao>

                    {resultados.length > 0 && (
                        <Secao titulo="Últimos resultados">
                            <JogosEmLista partidas={resultados} idCompeticao={competicao.id} />
                        </Secao>
                    )}
                </div>

                <div className="min-w-0 space-y-6 lg:order-1 lg:col-span-2">
                    <ClassificacaoPorFase idCompeticao={competicao.id} versao={versao} />

                    <Secao
                        titulo={`Equipes${competicao.equipes.length ? ` (${competicao.equipes.length})` : ""}`}
                    >
                        {competicao.equipes.length === 0 ? (
                            <Vazio conceito="equipe" titulo="Nenhuma equipe inscrita ainda" />
                        ) : (
                            <ListaDeInscritas equipes={competicao.equipes} />
                        )}
                    </Secao>
                </div>
            </div>
        </CorpoDaPagina>
    );
};

export default VisaoGeralPublica;
