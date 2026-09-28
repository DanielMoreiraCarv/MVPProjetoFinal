"use client";

import { Building2, Layers } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CarregandoCartoes, CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { AddCompetitionDialog } from "@/src/features/administracoes/addCompetitionDialog";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { Partida } from "@/src/lib/types/partida";
import { ICONES } from "@/src/lib/icones";
import { useEscopo } from "@/src/lib/escopo";

const Secao = ({ titulo, acao, className, children }: {
    titulo: string;
    acao?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section className={`space-y-3 ${className ?? ""}`}>
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {titulo}
            </h2>
            {acao}
        </div>
        {children}
    </section>
);

/**
 * As competições da administração em foco — não todas.
 *
 * Uma competição sempre pertence a uma administração, e ver as seis de duas
 * ligas diferentes numa lista só não ajuda ninguém: os nomes se repetem entre
 * administrações ("Futebol Masculino" existe em duas) e a lista cresce com o
 * número de clientes, não com o que a pessoa está fazendo.
 *
 * O foco vem do escopo: a administração escolhida na página de administrações,
 * ou a da competição aberta — inclusive quando ela foi aberta pela busca.
 */
const CompeticaoPage = () => {
    const {
        competicoes,
        carregando,
        erro,
        recarregar,
        administracaoAtual,
        escolherAdministracao,
    } = useEscopo();

    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregandoPartidas, setCarregandoPartidas] = useState(false);
    const IconeCompeticao = ICONES.competicao;

    const daAdministracao = useMemo(
        () =>
            administracaoAtual
                ? competicoes.filter((c) => c.idAdministracao === administracaoAtual.id)
                : [],
        [competicoes, administracaoAtual],
    );

    // Os próximos jogos seguem o mesmo foco das competições: jogo de outra
    // liga na tela desta não é informação, é ruído.
    useEffect(() => {
        if (daAdministracao.length === 0) {
            setPartidas([]);
            return;
        }
        let vigente = true;
        setCarregandoPartidas(true);
        Promise.all(daAdministracao.map((c) => listarPartidasDaCompeticao(c.id)))
            .then((porCompeticao) => {
                if (!vigente) return;
                setPartidas(porCompeticao.flat().filter((partida) => !partida.realizada));
            })
            .finally(() => vigente && setCarregandoPartidas(false));
        return () => {
            vigente = false;
        };
    }, [daAdministracao]);

    return (
        <>
            <CabecalhoDaPagina
                conceito="competicao"
                titulo="Competições"
                descricao={
                    administracaoAtual
                        ? `Organizadas por ${administracaoAtual.nome}`
                        : "Escolha uma administração para ver as competições dela."
                }
                migalhas={[
                    { rotulo: "Administrações", href: "/administracao" },
                    ...(administracaoAtual ? [{ rotulo: administracaoAtual.nome }] : []),
                ]}
                acoes={
                    administracaoAtual && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => escolherAdministracao(null)}
                                title="Deixar de filtrar por administração"
                            >
                                <Layers />
                                Trocar
                            </Button>
                            <AddCompetitionDialog
                                idAdministracao={administracaoAtual.id}
                                onSaved={recarregar}
                            />
                        </>
                    )
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={recarregar} />
                ) : !administracaoAtual && !carregando ? (
                    <Vazio
                        conceito="administracao"
                        titulo="Nenhuma administração em foco"
                        descricao="As competições são organizadas por quem as promove. Escolha uma administração, ou busque a competição pelo nome com ⌘K."
                        acao={
                            <Button size="sm" render={<Link href="/administracao" />}>
                                <Building2 />
                                Escolher administração
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Secao className="lg:col-span-2" titulo="Competições">
                            {carregando ? (
                                <CarregandoCartoes cartoes={4} />
                            ) : daAdministracao.length === 0 ? (
                                <Vazio
                                    conceito="competicao"
                                    titulo="Nenhuma competição aqui"
                                    descricao={`${administracaoAtual?.nome} ainda não tem competições.`}
                                    acao={
                                        administracaoAtual && (
                                            <AddCompetitionDialog
                                                idAdministracao={administracaoAtual.id}
                                                onSaved={recarregar}
                                            />
                                        )
                                    }
                                />
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {daAdministracao.map((competicao) => (
                                        <Link
                                            key={competicao.id}
                                            href={`/competicao/${competicao.id}`}
                                            className="block h-full"
                                        >
                                            <Card className="h-full transition-colors hover:border-ring">
                                                <CardHeader>
                                                    <CardTitle className="flex items-start gap-2">
                                                        <IconeCompeticao className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                        <span className="min-w-0">{competicao.nome}</span>
                                                    </CardTitle>
                                                    {competicao.descricao && (
                                                        <CardDescription>
                                                            {competicao.descricao}
                                                        </CardDescription>
                                                    )}
                                                    <CardDescription>
                                                        {[competicao.modalidade, competicao.categoria]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Secao>

                        <Secao titulo="Próximos jogos">
                            {carregando || carregandoPartidas ? (
                                <CarregandoLista linhas={4} />
                            ) : partidas.length === 0 ? (
                                <Vazio
                                    conceito="partida"
                                    titulo="Nenhum jogo agendado"
                                    descricao="As partidas aparecem quando uma fase gera os confrontos."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {partidas.map((partida) => (
                                        <Link
                                            key={partida.id}
                                            href={`/partida/${partida.id}`}
                                            className="block"
                                        >
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
                        </Secao>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default CompeticaoPage;
