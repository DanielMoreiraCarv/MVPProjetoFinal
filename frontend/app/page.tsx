"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CarregandoCartoes, CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { formatarDiaEHora, porDataHora } from "@/src/lib/formato";
import { ICONES } from "@/src/lib/icones";
import { useEscopo } from "@/src/lib/escopo";
import { Partida } from "@/src/lib/types/partida";
import { ROTULO_DO_ESTADO } from "@/src/lib/types/competicao";

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

const Numero = ({
    conceito,
    valor,
    rotulo,
    href,
}: {
    conceito: keyof typeof ICONES;
    valor: number | string;
    rotulo: string;
    href?: string;
}) => {
    const Icone = ICONES[conceito];

    const corpo = (
        <Card className="h-full transition-colors hover:border-ring">
            <CardHeader>
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icone className="size-4" />
                </span>
                <CardTitle className="numero-tabular font-mono text-2xl">{valor}</CardTitle>
                <CardDescription>{rotulo}</CardDescription>
            </CardHeader>
        </Card>
    );

    return href ? (
        <Link href={href} className="block h-full">
            {corpo}
        </Link>
    ) : (
        corpo
    );
};

/**
 * O que está acontecendo agora, a partir do escopo.
 *
 * A raiz era um redirecionamento para a lista de competições, então o item
 * "Início" do menu nunca ficava ativo e levava para outro lugar.
 */
const InicioPage = () => {
    const {
        competicoes,
        administracoes,
        administracaoAtual,
        atual,
        carregando,
        erro,
        recarregar,
        abrirPaleta,
        ultimoId,
    } = useEscopo();

    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregandoPartidas, setCarregandoPartidas] = useState(false);

    const daAdministracao = useMemo(
        () =>
            administracaoAtual
                ? competicoes.filter((c) => c.idAdministracao === administracaoAtual.id)
                : competicoes,
        [competicoes, administracaoAtual],
    );

    // A competição em foco é a aberta; sem ela, a última visitada; sem essa, a
    // primeira da administração — para a tela não nascer vazia.
    const emFoco = useMemo(
        () =>
            atual ??
            competicoes.find((c) => c.id === ultimoId) ??
            daAdministracao[0] ??
            null,
        [atual, competicoes, ultimoId, daAdministracao],
    );

    useEffect(() => {
        if (!emFoco) {
            setPartidas([]);
            return;
        }
        let vigente = true;
        setCarregandoPartidas(true);
        listarPartidasDaCompeticao(emFoco.id)
            .then((suas) => vigente && setPartidas(suas))
            .finally(() => vigente && setCarregandoPartidas(false));
        return () => {
            vigente = false;
        };
    }, [emFoco]);

    const proximas = useMemo(
        () => partidas.filter((p) => !p.realizada).sort(porDataHora).slice(0, 5),
        [partidas],
    );

    const encerradas = partidas.filter((p) => p.realizada).length;
    const IconePartida = ICONES.partida;

    return (
        <>
            <CabecalhoDaPagina
                conceito="inicio"
                titulo="Início"
                descricao={
                    emFoco
                        ? `${emFoco.nome} · ${emFoco.nomeDaAdministracao}`
                        : "Escolha uma competição para começar."
                }
                acoes={
                    <Button variant="outline" size="sm" onClick={abrirPaleta}>
                        <Search />
                        Buscar competição
                    </Button>
                }
            />
            <CorpoDaPagina className="space-y-6">
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={recarregar} />
                ) : carregando ? (
                    <CarregandoCartoes cartoes={4} />
                ) : competicoes.length === 0 ? (
                    <Vazio
                        conceito="competicao"
                        titulo="Nada cadastrado ainda"
                        descricao="Comece criando uma administração e a primeira competição dela."
                        acao={
                            <Button size="sm" render={<Link href="/competicao" />}>
                                Ir para competições
                                <ArrowRight />
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <Secao titulo="Panorama">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <Numero
                                    conceito="administracao"
                                    valor={administracoes.length}
                                    rotulo={
                                        administracoes.length === 1
                                            ? "administração"
                                            : "administrações"
                                    }
                                    href="/competicao"
                                />
                                <Numero
                                    conceito="competicao"
                                    valor={competicoes.length}
                                    rotulo={
                                        competicoes.length === 1 ? "competição" : "competições"
                                    }
                                    href="/competicao"
                                />
                                <Numero
                                    conceito="equipe"
                                    valor={emFoco?.equipes.length ?? 0}
                                    rotulo="equipes inscritas na competição em foco"
                                    href={emFoco ? `/competicao/${emFoco.id}` : undefined}
                                />
                                <Numero
                                    conceito="partida"
                                    valor={carregandoPartidas ? "…" : encerradas}
                                    rotulo="partidas encerradas na competição em foco"
                                    href={emFoco ? `/competicao/${emFoco.id}` : undefined}
                                />
                            </div>
                        </Secao>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <Secao
                                className="lg:col-span-2"
                                titulo="Próximos jogos"
                                acao={
                                    emFoco && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            render={<Link href={`/competicao/${emFoco.id}`} />}
                                        >
                                            Ver a competição
                                            <ArrowRight />
                                        </Button>
                                    )
                                }
                            >
                                {!emFoco ? (
                                    <Vazio
                                        conceito="competicao"
                                        titulo="Nenhuma competição em foco"
                                        descricao="Busque pelo nome com ⌘K ou escolha na lista."
                                    />
                                ) : carregandoPartidas ? (
                                    <CarregandoLista linhas={4} />
                                ) : proximas.length === 0 ? (
                                    <Vazio
                                        conceito="partida"
                                        titulo="Nenhum jogo agendado"
                                        descricao="As partidas aparecem quando uma fase gera os confrontos."
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        {proximas.map((partida) => (
                                            <Link
                                                key={partida.id}
                                                href={`/competicao/${emFoco.id}/partida/${partida.id}`}
                                                className="block"
                                            >
                                                <Card className="transition-colors hover:border-ring">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-start gap-2 text-sm">
                                                            <IconePartida className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                            <span className="min-w-0">
                                                                {partida.equipeMandante} ×{" "}
                                                                {partida.equipeVisitante}
                                                            </span>
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {formatarDiaEHora(partida.dataHora)}
                                                            {partida.local
                                                                ? ` · ${partida.local}`
                                                                : ""}
                                                        </CardDescription>
                                                    </CardHeader>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </Secao>

                            <Secao titulo="Competições">
                                <div className="space-y-2">
                                    {daAdministracao.slice(0, 6).map((competicao) => (
                                        <Link
                                            key={competicao.id}
                                            href={`/competicao/${competicao.id}`}
                                            className="block"
                                        >
                                            <Card
                                                className={cn(
                                                    "transition-colors hover:border-ring",
                                                    competicao.id === emFoco?.id &&
                                                        "border-primary/40",
                                                )}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-sm">
                                                        {competicao.nome}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {competicao.nomeDaAdministracao}
                                                        {competicao.estado
                                                            ? ` · ${ROTULO_DO_ESTADO[competicao.estado]}`
                                                            : ""}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </Secao>
                        </div>
                    </>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default InicioPage;
