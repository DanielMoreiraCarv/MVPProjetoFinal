"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { useCompeticaoAcompanhada } from "@/src/features/acompanhamento/Acompanhamento";
import { IndicadorDeAtualizacao } from "@/src/features/acompanhamento/IndicadorDeAtualizacao";
import { JogosEmLista } from "@/src/features/acompanhamento/JogosEmLista";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { porDataHora } from "@/src/lib/formato";
import { Partida } from "@/src/lib/types/partida";
import { useAtualizacaoPeriodica } from "@/src/lib/useAtualizacaoPeriodica";

/** O calendário inteiro: o que falta jogar primeiro, e os resultados do mais recente para trás. */
const PartidasPublicas = () => {
    const competicao = useCompeticaoAcompanhada();
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const buscar = useCallback(
        () => listarPartidasDaCompeticao(competicao.id, "publico").then(setPartidas),
        [competicao.id],
    );
    const ativa = competicao.estado === "EM_ANDAMENTO";
    const aoVivo = useAtualizacaoPeriodica(buscar, { ativa });
    const { marcarComoAtualizado } = aoVivo;

    const carregar = useCallback(() => {
        setCarregando(true);
        setErro(null);
        buscar()
            .then(marcarComoAtualizado)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [buscar, marcarComoAtualizado]);

    useEffect(carregar, [carregar]);

    const aJogar = useMemo(
        () => partidas.filter((partida) => !partida.realizada).sort(porDataHora),
        [partidas],
    );
    const encerradas = useMemo(
        () => partidas.filter((partida) => partida.realizada).sort(porDataHora).reverse(),
        [partidas],
    );

    return (
        <CorpoDaPagina className="space-y-6">
            <IndicadorDeAtualizacao
                className="justify-end"
                atualizadoEm={aoVivo.atualizadoEm}
                atualizando={aoVivo.atualizando}
                falhou={aoVivo.falhou}
                ativa={ativa}
                aoAtualizar={aoVivo.atualizarAgora}
            />
            {erro ? (
                <Erro causa={erro} aoTentarDeNovo={carregar} />
            ) : carregando ? (
                <CarregandoLista linhas={6} />
            ) : partidas.length === 0 ? (
                <Vazio
                    conceito="calendario"
                    titulo="Calendário vazio"
                    descricao="Os jogos aparecem aqui quando a organização montar a tabela."
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Secao titulo={`A jogar (${aJogar.length})`}>
                        {aJogar.length === 0 ? (
                            <Vazio conceito="partida" titulo="Nenhum jogo pela frente" />
                        ) : (
                            <JogosEmLista partidas={aJogar} idCompeticao={competicao.id} />
                        )}
                    </Secao>
                    <Secao titulo={`Resultados (${encerradas.length})`}>
                        {encerradas.length === 0 ? (
                            <Vazio conceito="partida" titulo="Nenhum jogo encerrado ainda" />
                        ) : (
                            <JogosEmLista partidas={encerradas} idCompeticao={competicao.id} />
                        )}
                    </Secao>
                </div>
            )}
        </CorpoDaPagina>
    );
};

export default PartidasPublicas;
