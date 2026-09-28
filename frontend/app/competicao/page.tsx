"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CarregandoCartoes, CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { listarCompeticoes } from "@/src/lib/api/competicoes";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { Competicao } from "@/src/lib/types/competicao";
import { Partida } from "@/src/lib/types/partida";

// A tela é reescrita na entrega da página de competições. Aqui ela ganha a
// moldura nova e os estados que nenhuma tela tinha: enquanto carregava ficava
// em branco, e quando falhava ficava em branco também.
const CompeticaoPage = () => {
    const [competicoes, setCompeticoes] = useState<Competicao[]>([]);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = () => {
        setCarregando(true);
        setErro(null);
        listarCompeticoes()
            .then(async (todas) => {
                setCompeticoes(todas);
                const porCompeticao = await Promise.all(
                    todas.map((competicao) => listarPartidasDaCompeticao(competicao.id)),
                );
                setPartidas(porCompeticao.flat().filter((partida) => !partida.realizada));
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, []);

    return (
        <>
            <CabecalhoDaPagina
                conceito="competicao"
                titulo="Competições"
                descricao="Os certames em disputa, de todas as administrações."
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <section className="space-y-3 lg:col-span-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Competições
                            </h2>
                            {carregando ? (
                                <CarregandoCartoes cartoes={4} />
                            ) : competicoes.length === 0 ? (
                                <Vazio
                                    conceito="competicao"
                                    titulo="Nenhuma competição ainda"
                                    descricao="As competições são criadas dentro de uma administração."
                                />
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {competicoes.map((competicao) => (
                                        <Link key={competicao.id} href={`/competicao/${competicao.id}`}>
                                            <Card className="h-full transition-colors hover:border-ring">
                                                <CardHeader>
                                                    <CardTitle>{competicao.nome}</CardTitle>
                                                    <CardDescription>
                                                        {competicao.descricao}
                                                    </CardDescription>
                                                    <CardDescription>
                                                        {competicao.modalidade} · {competicao.categoria}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Próximos jogos
                            </h2>
                            {carregando ? (
                                <CarregandoLista linhas={4} />
                            ) : partidas.length === 0 ? (
                                <Vazio
                                    conceito="partida"
                                    titulo="Nenhum jogo agendado"
                                    descricao="As partidas aparecem aqui quando uma fase gera os confrontos."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {partidas.map((partida) => (
                                        <Link key={partida.id} href={`/partida/${partida.id}`}>
                                            <Card className="transition-colors hover:border-ring">
                                                <CardHeader>
                                                    <CardTitle className="text-sm">
                                                        {partida.equipeMandante} × {partida.equipeVisitante}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {partida.nomeCompeticao} · {partida.fase}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default CompeticaoPage;
