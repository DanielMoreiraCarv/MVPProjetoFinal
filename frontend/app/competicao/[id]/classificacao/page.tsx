"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { CarregandoTabela, Erro, Vazio } from "@/src/components/estado/Estados";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import {
    Classificado,
    Fase,
    ROTULO_DO_FORMATO,
    listarClassificacaoDaFase,
    listarFasesDaCompeticao,
} from "@/src/lib/api/fases";
import { useEscopo } from "@/src/lib/escopo";


const porOrdem = (a: Fase, b: Fase) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id;

const Secao = ({
    titulo,
    acao,
    className,
    children,
}: {
    titulo: string;
    acao?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section className={cn("space-y-3", className)}>
        <div className="flex min-h-9 items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {titulo}
            </h2>
            {acao}
        </div>
        {children}
    </section>
);

/**
 * A classificação de cada fase, como o servidor a apura.
 *
 * A conta é do servidor por RNF23, e a rota `GET /fase/{id}/classificacao`
 * devolve só a ordem: posição, equipe e nome. Pontos, jogos, vitórias e saldo
 * não vêm — e recalculá-los aqui seria justamente o que o requisito proíbe.
 * A tabela mostra o que existe.
 */
const ClassificacaoPage = () => {
    const params = useParams<{ id: string }>();
    const idCompeticao = Number(params?.id);
    const { atual } = useEscopo();

    const [fases, setFases] = useState<Fase[]>([]);
    const [escolhida, setEscolhida] = useState<string[]>([]);
    const [linhas, setLinhas] = useState<Classificado[]>([]);
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
                    anterior[0] && lista.some((fase) => String(fase.id) === anterior[0])
                        ? anterior
                        : lista.length > 0
                          ? [String([...lista].sort(porOrdem)[0].id)]
                          : [],
                );
            })
            .catch(setErro)
            .finally(() => setCarregandoFases(false));
    }, [idCompeticao]);

    useEffect(carregarFases, [carregarFases]);

    const idDaFase = escolhida[0] ? Number(escolhida[0]) : null;

    const carregarTabela = useCallback(() => {
        if (idDaFase === null) {
            setLinhas([]);
            return;
        }
        setCarregandoTabela(true);
        setErro(null);
        listarClassificacaoDaFase(idDaFase)
            .then(setLinhas)
            .catch(setErro)
            .finally(() => setCarregandoTabela(false));
    }, [idDaFase]);

    useEffect(carregarTabela, [carregarTabela]);

    const emOrdem = useMemo(() => [...fases].sort(porOrdem), [fases]);
    const fase = emOrdem.find((cada) => cada.id === idDaFase) ?? null;

    return (
        <>
            <CabecalhoDaPagina
                conceito="classificacao"
                titulo="Classificação"
                descricao="A ordem apurada pelo servidor em cada fase."
                migalhas={[
                    { rotulo: "Competições", href: "/competicao" },
                    ...(atual
                        ? [
                              { rotulo: atual.nomeDaAdministracao },
                              { rotulo: atual.nome, href: `/competicao/${idCompeticao}` },
                          ]
                        : []),
                    { rotulo: "Classificação" },
                ]}
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro
                        causa={erro}
                        aoTentarDeNovo={idDaFase === null ? carregarFases : carregarTabela}
                    />
                ) : carregandoFases ? (
                    <CarregandoTabela linhas={8} colunas={2} />
                ) : emOrdem.length === 0 ? (
                    <Vazio
                        conceito="fase"
                        titulo="Nenhuma fase nesta competição"
                        descricao="A classificação é apurada por fase. Crie a primeira fase para ter uma."
                        acao={
                            <Link
                                href={`/competicao/${idCompeticao}/fase`}
                                className="text-sm underline underline-offset-4"
                            >
                                Ir para as fases
                            </Link>
                        }
                    />
                ) : (
                    <Secao
                        titulo={fase ? fase.nome : "Classificação"}
                        acao={
                            <ToggleGroup
                                value={escolhida}
                                onValueChange={(valor) => valor.length > 0 && setEscolhida(valor)}
                                spacing={0}
                                variant="outline"
                                className="flex-wrap"
                                aria-label="Fase"
                            >
                                {emOrdem.map((cada) => (
                                    <ToggleGroupItem key={cada.id} value={String(cada.id)}>
                                        {cada.nome}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        }
                    >
                        {carregandoTabela ? (
                            <CarregandoTabela linhas={8} colunas={2} />
                        ) : linhas.length === 0 ? (
                            <Vazio
                                conceito="classificacao"
                                titulo="Esta fase ainda não tem classificação"
                                descricao="A ordem aparece depois que os confrontos da fase são gerados."
                                acao={
                                    <Link
                                        href={`/competicao/${idCompeticao}/fase`}
                                        className="text-sm underline underline-offset-4"
                                    >
                                        Gerar confrontos nas fases
                                    </Link>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                <div className="overflow-x-auto rounded-3xl border border-border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="text-xs">
                                                <TableHead className="w-12 pl-5">#</TableHead>
                                                <TableHead className="pr-5">Equipe</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {linhas.map((linha, i) => (
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

                                {/* O que a rota não devolve, dito na tela: sem
                                    isto a tabela parece incompleta por engano. */}
                                <p className="px-1 text-xs text-muted-foreground">
                                    {fase?.formato
                                        ? `${ROTULO_DO_FORMATO[fase.formato]} · `
                                        : ""}
                                    a API devolve apenas a ordem apurada. Pontos, jogos, vitórias
                                    e saldo não vêm nesta rota, e a conta é do servidor.
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
