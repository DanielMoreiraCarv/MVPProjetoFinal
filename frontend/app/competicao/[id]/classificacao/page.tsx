"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Escolha } from "@/src/components/Escolha";
import { CarregandoTabela, Erro, Vazio } from "@/src/components/estado/Estados";
import {
    CabecalhoDaPagina,
    CorpoDaPagina,
    migalhasDaCompeticao,
} from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { TabelasPorGrupo } from "@/src/features/campeonatos/TabelasPorGrupo";
import {
    Classificado,
    Fase,
    LinhaDaTabela,
    ROTULO_DO_FORMATO,
    listarClassificacaoDaFase,
    listarFasesDaCompeticao,
    listarTabelaDaFase,
    temTabelaDePontos,
} from "@/src/lib/api/fases";
import { useEscopo } from "@/src/lib/escopo";

const porOrdem = (a: Fase, b: Fase) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id;

/**
 * A classificação de cada fase, como o servidor a apura (RNF23).
 *
 * Fase que se decide por pontos — grupos e pontos corridos — mostra a tabela
 * completa, com quem entra na fase listado e zerado desde o início: não se
 * espera o primeiro jogo para a equipe aparecer. A eliminatória não tem
 * pontos, e mostra a ordem em que as equipes saíram.
 */
const ClassificacaoPage = () => {
    const params = useParams<{ id: string }>();
    const idCompeticao = Number(params?.id);
    const { atual } = useEscopo();

    const [fases, setFases] = useState<Fase[]>([]);
    const [escolhida, setEscolhida] = useState("");
    const [tabela, setTabela] = useState<LinhaDaTabela[]>([]);
    const [ordem, setOrdem] = useState<Classificado[]>([]);
    const [carregandoFases, setCarregandoFases] = useState(true);
    const [carregandoTabela, setCarregandoTabela] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    const carregarFases = useCallback(() => {
        if (!Number.isFinite(idCompeticao)) return;
        setCarregandoFases(true);
        setErro(null);
        listarFasesDaCompeticao(idCompeticao)
            .then((lista) => {
                setFases(lista);
                setEscolhida((anterior) =>
                    anterior && lista.some((fase) => String(fase.id) === anterior)
                        ? anterior
                        : lista.length > 0
                          ? String([...lista].sort(porOrdem)[0].id)
                          : "",
                );
            })
            .catch(setErro)
            .finally(() => setCarregandoFases(false));
    }, [idCompeticao]);

    useEffect(carregarFases, [carregarFases]);

    const emOrdem = useMemo(() => [...fases].sort(porOrdem), [fases]);
    const fase = emOrdem.find((cada) => String(cada.id) === escolhida) ?? null;
    const porPontos = temTabelaDePontos(fase?.formato);
    const anterior = fase ? emOrdem.find((cada) => cada.idFaseSucessora === fase.id) : undefined;

    const carregarTabela = useCallback(() => {
        if (!fase) return;
        setCarregandoTabela(true);
        setErro(null);
        const busca = temTabelaDePontos(fase.formato)
            ? listarTabelaDaFase(fase.id).then((linhas) => {
                  setTabela(linhas);
                  setOrdem([]);
              })
            : listarClassificacaoDaFase(fase.id).then((linhas) => {
                  setOrdem(linhas);
                  setTabela([]);
              });
        busca.catch(setErro).finally(() => setCarregandoTabela(false));
    }, [fase]);

    useEffect(carregarTabela, [carregarTabela]);

    const ninguemJogou = tabela.every((linha) => linha.jogos === 0);
    const gruposAindaNaoSorteados =
        fase?.formato === "GRUPOS" && tabela.every((linha) => linha.grupo === undefined);

    return (
        <>
            <CabecalhoDaPagina
                conceito="classificacao"
                titulo="Classificação"
                descricao="A tabela de cada fase, com todas as equipes desde o início."
                migalhas={migalhasDaCompeticao(atual)}
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={fase ? carregarTabela : carregarFases} />
                ) : carregandoFases ? (
                    <CarregandoTabela linhas={8} colunas={4} />
                ) : emOrdem.length === 0 ? (
                    <Vazio
                        conceito="fase"
                        titulo="Nenhuma fase nesta competição"
                        descricao="A classificação é apurada por fase. Crie a primeira fase para ter uma."
                        acao={
                            <Button
                                size="sm"
                                nativeButton={false}
                                render={<Link href={`/competicao/${idCompeticao}/fase`} />}
                            >
                                Ir para as fases
                            </Button>
                        }
                    />
                ) : (
                    <Secao
                        titulo={fase ? fase.nome : "Classificação"}
                        descricao={
                            fase?.formato
                                ? `${ROTULO_DO_FORMATO[fase.formato]}${
                                      fase.classificados ? ` · ${fase.classificados} avançam` : ""
                                  }`
                                : undefined
                        }
                        acao={
                            emOrdem.length > 1 && (
                                <Escolha
                                    valor={escolhida}
                                    aoMudar={setEscolhida}
                                    className="w-56"
                                    opcoes={emOrdem.map((cada) => ({
                                        valor: String(cada.id),
                                        rotulo: cada.nome,
                                    }))}
                                />
                            )
                        }
                    >
                        {carregandoTabela ? (
                            <CarregandoTabela linhas={8} colunas={porPontos ? 10 : 2} />
                        ) : porPontos ? (
                            tabela.length === 0 ? (
                                <Vazio
                                    conceito="classificacao"
                                    titulo={
                                        anterior
                                            ? `Aguardando ${anterior.nome}`
                                            : "Nenhuma equipe entra nesta fase"
                                    }
                                    descricao={
                                        anterior
                                            ? `As equipes desta fase são os classificados de ${anterior.nome}, e aparecem aqui quando ela tiver classificação.`
                                            : "Inscreva as equipes na competição para a tabela começar."
                                    }
                                />
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
                        ) : ordem.length === 0 ? (
                            <Vazio
                                conceito="classificacao"
                                titulo="A eliminatória ainda não tem classificação"
                                descricao="A ordem aparece conforme as equipes forem eliminadas."
                                acao={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        nativeButton={false}
                                        render={<Link href={`/competicao/${idCompeticao}/fase`} />}
                                    >
                                        Ir para as fases
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                <div className="overflow-x-auto rounded-2xl border border-border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="text-xs">
                                                <TableHead className="w-14 pl-5">#</TableHead>
                                                <TableHead className="pr-5">Equipe</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ordem.map((linha, i) => (
                                                <TableRow
                                                    key={linha.idEquipe ?? linha.nomeEquipe}
                                                    className={i % 2 !== 0 ? "bg-muted/40" : ""}
                                                >
                                                    <TableCell className="numero-tabular pl-5 font-mono text-muted-foreground">
                                                        {linha.posicao ?? i + 1}
                                                    </TableCell>
                                                    <TableCell className="pr-5 font-medium">
                                                        {linha.idEquipe ? (
                                                            <Link
                                                                href={`/equipe/${linha.idEquipe}`}
                                                                className="hover:underline"
                                                            >
                                                                {linha.nomeEquipe}
                                                            </Link>
                                                        ) : (
                                                            linha.nomeEquipe
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <p className="px-1 text-xs text-muted-foreground">
                                    Na eliminatória a classificação é a ordem de saída: quem caiu na
                                    mesma rodada divide a posição.
                                </p>
                            </div>
                        )}
                    </Secao>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default ClassificacaoPage;
