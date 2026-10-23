"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { useCompeticaoAcompanhada } from "@/src/features/acompanhamento/Acompanhamento";
import { IndicadorDeAtualizacao } from "@/src/features/acompanhamento/IndicadorDeAtualizacao";
import { LancesDaPartida } from "@/src/features/acompanhamento/LancesDaPartida";
import { PlacarAoVivo, situacaoDaPartida } from "@/src/features/acompanhamento/PlacarAoVivo";
import { CompartilharDialog } from "@/src/features/compartilhar/CompartilharDialog";
import { TabelaDoElenco } from "@/src/features/sumula/TabelaDoElenco";
import { ApiError } from "@/src/lib/api/client";
import { listarElenco } from "@/src/lib/api/equipes";
import { buscarPartida } from "@/src/lib/api/partidas";
import { buscarSumulaDaPartida } from "@/src/lib/api/sumulas";
import { formatarDataHora, formatarDiaDaSemana } from "@/src/lib/formato";
import { Atleta } from "@/src/lib/types/atleta";
import { Partida } from "@/src/lib/types/partida";
import { Sumula } from "@/src/lib/types/sumula";
import { useAtualizacaoPeriodica } from "@/src/lib/useAtualizacaoPeriodica";
import { enderecoPublicoDaCompeticao } from "@/src/lib/visao-publica";

const Dado = ({ rotulo, valor }: { rotulo: string; valor: string }) => (
    <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{rotulo}</p>
        <p className="text-sm font-medium first-letter:uppercase">{valor}</p>
    </div>
);

const nada = () => undefined;

/**
 * A súmula vista de fora, atualizando sozinha enquanto a partida não termina.
 * Não é um fluxo de eventos: a cada intervalo pergunta de novo à API — o que
 * basta para quem acompanha da arquibancada ou de casa.
 */
const PartidaAoVivo = () => {
    const competicao = useCompeticaoAcompanhada();
    const params = useParams<{ idPartida: string }>();
    const idPartida = Number(params?.idPartida);

    const [partida, setPartida] = useState<Partida | null>(null);
    const [sumula, setSumula] = useState<Sumula | null>(null);
    const [elencoMandante, setElencoMandante] = useState<Atleta[]>([]);
    const [elencoVisitante, setElencoVisitante] = useState<Atleta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const buscarPlacar = useCallback(async () => {
        const [suaPartida, suaSumula] = await Promise.all([
            buscarPartida(idPartida, "publico"),
            buscarSumulaDaPartida(idPartida, "publico"),
        ]);
        setPartida(suaPartida);
        setSumula(suaSumula);
        return suaPartida;
    }, [idPartida]);

    const situacao = partida ? situacaoDaPartida(partida, sumula) : "agendada";
    // Partida de outra competição não se mostra por este link: o endereço
    // traz a competição, e é ela que foi aberta ao público.
    const daCompeticao = partida?.idCompeticao === competicao.id;
    const aoVivo = useAtualizacaoPeriodica(buscarPlacar, {
        ativa: daCompeticao && situacao !== "encerrada",
    });
    const { marcarComoAtualizado } = aoVivo;

    const carregar = useCallback(() => {
        if (!Number.isFinite(idPartida)) {
            setCarregando(false);
            return;
        }
        setCarregando(true);
        setErro(null);
        buscarPlacar()
            .then(async (suaPartida) => {
                marcarComoAtualizado();
                // O elenco não muda durante o jogo: vem uma vez só.
                const [doMandante, doVisitante] = await Promise.all([
                    suaPartida.idEquipeMandante ? listarElenco(suaPartida.idEquipeMandante, "publico") : [],
                    suaPartida.idEquipeVisitante ? listarElenco(suaPartida.idEquipeVisitante, "publico") : [],
                ]);
                setElencoMandante(doMandante);
                setElencoVisitante(doVisitante);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idPartida, buscarPlacar, marcarComoAtualizado]);

    useEffect(carregar, [carregar]);

    const golsAnotados = useMemo(
        () => (sumula?.eventos ?? []).some((evento) => evento.tipo === "GOL" || evento.tipo === "GOL_CONTRA"),
        [sumula],
    );

    const voltar = (
        <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={enderecoPublicoDaCompeticao(competicao.id)} />}
        >
            <ArrowLeft />
            {competicao.nome}
        </Button>
    );

    const naoEncontrada =
        !Number.isFinite(idPartida) ||
        (erro instanceof ApiError && erro.status === 404) ||
        (partida !== null && !daCompeticao);

    if (naoEncontrada) {
        return (
            <CorpoDaPagina>
                <Vazio
                    conceito="partida"
                    titulo="Partida não encontrada nesta competição"
                    descricao="O link pode estar incompleto. Veja os jogos da competição."
                    acao={voltar}
                />
            </CorpoDaPagina>
        );
    }

    return (
        <CorpoDaPagina className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="-ml-3 min-w-0">{voltar}</div>
                <IndicadorDeAtualizacao
                    atualizadoEm={aoVivo.atualizadoEm}
                    atualizando={aoVivo.atualizando}
                    falhou={aoVivo.falhou}
                    ativa={situacao !== "encerrada"}
                    aoAtualizar={aoVivo.atualizarAgora}
                />
            </div>

            {erro ? (
                <Erro causa={erro} aoTentarDeNovo={carregar} />
            ) : carregando || !partida ? (
                <CarregandoLista linhas={5} />
            ) : (
                <>
                    <PlacarAoVivo
                        partida={partida}
                        sumula={sumula}
                        acao={
                            <CompartilharDialog
                                competicao={competicao}
                                partida={{
                                    id: partida.id,
                                    rotulo: `${partida.equipeMandante} × ${partida.equipeVisitante}`,
                                }}
                            />
                        }
                    />

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="min-w-0 space-y-6 lg:col-span-2">
                            <Secao
                                titulo="Lances"
                                descricao={
                                    sumula && !golsAnotados && sumula.placarMandante + sumula.placarVisitante > 0
                                        ? "Os gols deste jogo foram lançados só no placar, sem o autor."
                                        : undefined
                                }
                            >
                                {!sumula ? (
                                    <Vazio
                                        conceito="sumula"
                                        titulo={
                                            situacao === "encerrada"
                                                ? "Partida sem súmula"
                                                : "A partida ainda não começou"
                                        }
                                        descricao={
                                            situacao === "encerrada"
                                                ? "O resultado foi lançado direto, sem os lances do jogo."
                                                : "Gols e cartões aparecem aqui assim que a mesa abrir a súmula. Esta página se atualiza sozinha."
                                        }
                                    />
                                ) : (
                                    <LancesDaPartida partida={partida} eventos={sumula.eventos} />
                                )}
                            </Secao>

                        </div>

                        <div className="min-w-0 space-y-6">
                            <Secao titulo="Dados da partida">
                                <div className="grid gap-x-6 gap-y-4 rounded-3xl border border-border px-5 py-4 sm:grid-cols-2 lg:grid-cols-1">
                                    <Dado
                                        rotulo="Data e hora"
                                        valor={formatarDataHora(partida.dataHora, "A definir")}
                                    />
                                    {partida.dataHora && (
                                        <Dado
                                            rotulo="Dia da semana"
                                            valor={formatarDiaDaSemana(partida.dataHora)}
                                        />
                                    )}
                                    <Dado rotulo="Local" valor={partida.local ?? "A definir"} />
                                    {partida.fase && <Dado rotulo="Fase" valor={partida.fase} />}
                                    <Dado
                                        rotulo="Árbitro"
                                        valor={sumula?.arbitro || partida.arbitro || "A definir"}
                                    />
                                </div>
                            </Secao>

                            {sumula?.assinada && sumula.observacoes && (
                                <Secao titulo="Observações da súmula">
                                    <p className="rounded-3xl border border-border px-5 py-4 text-sm">
                                        {sumula.observacoes}
                                    </p>
                                </Secao>
                            )}
                        </div>
                    </div>

                    {sumula?.modo === "COMPLETA" && (
                        <Secao titulo="Por atleta">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <TabelaDoElenco
                                    equipe={partida.equipeMandante}
                                    atletas={elencoMandante}
                                    eventos={sumula.eventos}
                                    corrigindo={false}
                                    editavel={false}
                                    pendente={null}
                                    aoTocar={nada}
                                />
                                <TabelaDoElenco
                                    equipe={partida.equipeVisitante}
                                    atletas={elencoVisitante}
                                    eventos={sumula.eventos}
                                    corrigindo={false}
                                    editavel={false}
                                    pendente={null}
                                    aoTocar={nada}
                                />
                            </div>
                        </Secao>
                    )}
                </>
            )}
        </CorpoDaPagina>
    );
};

export default PartidaAoVivo;
