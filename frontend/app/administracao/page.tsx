"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CarregandoCartoes, Erro, Vazio } from "@/src/components/estado/Estados";
import { AddAdministrationDialog } from "@/src/features/administracoes/addAdministrationDialog";
import { AddCompetitionDialog } from "@/src/features/administracoes/addCompetitionDialog";
import { ICONES } from "@/src/lib/icones";
import { useEscopo } from "@/src/lib/escopo";

const Secao = ({ titulo, acao, className, children }: {
    titulo: string;
    acao?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {titulo}
            </h2>
            {acao}
        </div>
        {children}
    </section>
);

const AdministracaoPage = () => {
    const {
        administracoes,
        competicoes,
        carregando,
        erro,
        recarregar,
        administracaoAtual,
        escolherAdministracao,
    } = useEscopo();

    const IconeAdministracao = ICONES.administracao;
    const IconeCompeticao = ICONES.competicao;

    const daAdministracao = useMemo(
        () =>
            administracaoAtual
                ? competicoes.filter((c) => c.idAdministracao === administracaoAtual.id)
                : [],
        [competicoes, administracaoAtual],
    );

    return (
        <>
            <CabecalhoDaPagina
                conceito="administracao"
                titulo="Administrações"
                descricao="Quem organiza as competições: liga, associação, escola."
                acoes={<AddAdministrationDialog onSaved={recarregar} />}
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={recarregar} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Secao titulo="Administrações" className="lg:col-span-1">
                            {carregando ? (
                                <CarregandoCartoes cartoes={2} />
                            ) : administracoes.length === 0 ? (
                                <Vazio
                                    conceito="administracao"
                                    titulo="Nenhuma administração ainda"
                                    descricao="Comece criando quem organiza as competições."
                                    acao={<AddAdministrationDialog onSaved={recarregar} />}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {administracoes.map((administracao) => {
                                        const selecionada = administracao.id === administracaoAtual?.id;
                                        const quantas = competicoes.filter(
                                            (c) => c.idAdministracao === administracao.id,
                                        ).length;

                                        return (
                                            <button
                                                key={administracao.id}
                                                type="button"
                                                aria-pressed={selecionada}
                                                onClick={() => escolherAdministracao(administracao.id)}
                                                className={cn(
                                                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                                                    selecionada
                                                        ? "border-primary/40 bg-accent/60"
                                                        : "border-border hover:border-ring",
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                                                        selecionada
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted text-muted-foreground",
                                                    )}
                                                >
                                                    {selecionada ? (
                                                        <Check className="size-4" />
                                                    ) : (
                                                        <IconeAdministracao className="size-4" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1 space-y-0.5">
                                                    <span className="block truncate font-medium">
                                                        {administracao.nome}
                                                    </span>
                                                    {administracao.descricao && (
                                                        <span className="block text-sm text-muted-foreground">
                                                            {administracao.descricao}
                                                        </span>
                                                    )}
                                                    <span className="block text-xs text-muted-foreground">
                                                        {quantas === 1
                                                            ? "1 competição"
                                                            : `${quantas} competições`}
                                                    </span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </Secao>

                        <Secao
                            className="lg:col-span-2"
                            titulo={
                                administracaoAtual
                                    ? `Competições de ${administracaoAtual.nome}`
                                    : "Competições"
                            }
                            acao={
                                administracaoAtual && (
                                    <AddCompetitionDialog
                                        idAdministracao={administracaoAtual.id}
                                        onSaved={recarregar}
                                    />
                                )
                            }
                        >
                            {carregando ? (
                                <CarregandoCartoes cartoes={4} />
                            ) : !administracaoAtual ? (
                                <Vazio
                                    conceito="administracao"
                                    titulo="Escolha uma administração"
                                    descricao="As competições são listadas por quem as organiza."
                                />
                            ) : daAdministracao.length === 0 ? (
                                <Vazio
                                    conceito="competicao"
                                    titulo="Nenhuma competição aqui"
                                    descricao={`${administracaoAtual.nome} ainda não tem competições.`}
                                    acao={
                                        <AddCompetitionDialog
                                            idAdministracao={administracaoAtual.id}
                                            onSaved={recarregar}
                                        />
                                    }
                                />
                            ) : (
                                <div className="space-y-3">
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
                                                            <span className="min-w-0">
                                                                {competicao.nome}
                                                            </span>
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
                                    <Button variant="ghost" size="sm" render={<Link href="/competicao" />}>
                                        Ver na página de competições
                                        <ArrowRight />
                                    </Button>
                                </div>
                            )}
                        </Secao>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default AdministracaoPage;
