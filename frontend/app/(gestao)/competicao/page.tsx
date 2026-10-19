"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoCartoes, Erro, Vazio } from "@/src/components/estado/Estados";
import { AdministracaoDialog } from "@/src/features/administracoes/AdministracaoDialog";
import { CompeticaoDialog } from "@/src/features/administracoes/CompeticaoDialog";
import { removerAdministracao } from "@/src/lib/api/administracoes";
import { useAvisos } from "@/src/lib/avisos";
import { ICONES } from "@/src/lib/icones";
import { useEscopo } from "@/src/lib/escopo";
import { ROTULO_DO_ESTADO } from "@/src/lib/types/competicao";

/**
 * Administrações e competições na mesma página.
 *
 * Eram duas, e a segunda não tinha como existir sozinha: competição sem
 * administração escolhida não tem o que listar, e com uma escolhida repetia o
 * que a primeira já mostrava ao lado. Escolher à esquerda, ver à direita.
 */

const CompeticaoPage = () => {
    const {
        administracoes,
        competicoes,
        carregando,
        erro,
        recarregar,
        administracaoAtual,
        escolherAdministracao,
    } = useEscopo();
    const avisos = useAvisos();

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
                conceito="competicao"
                titulo="Competições"
                descricao="Escolha a administração para ver as competições que ela organiza."
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={recarregar} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Secao
                            titulo="Administrações"
                            acao={<AdministracaoDialog aoSalvar={recarregar} />}
                        >
                            {carregando ? (
                                <CarregandoCartoes cartoes={2} />
                            ) : administracoes.length === 0 ? (
                                <Vazio
                                    conceito="administracao"
                                    titulo="Nenhuma administração ainda"
                                    descricao="Comece criando quem organiza as competições."
                                    acao={<AdministracaoDialog aoSalvar={recarregar} />}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {administracoes.map((administracao) => {
                                        const selecionada =
                                            administracao.id === administracaoAtual?.id;
                                        const quantas = competicoes.filter(
                                            (c) => c.idAdministracao === administracao.id,
                                        ).length;

                                        return (
                                            <button
                                                key={administracao.id}
                                                type="button"
                                                aria-pressed={selecionada}
                                                onClick={() =>
                                                    escolherAdministracao(administracao.id)
                                                }
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
                                                    <span className="block truncate font-medium" title={administracao.nome}>
                                                        {administracao.nome}
                                                    </span>
                                                    {administracao.descricao && (
                                                        <span className="line-clamp-2 text-sm text-muted-foreground">
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
                                    <>
                                        <AdministracaoDialog
                                            administracao={administracaoAtual}
                                            aoSalvar={recarregar}
                                            gatilho={
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Editar ${administracaoAtual.nome}`}
                                                    title="Editar administração"
                                                >
                                                    <Pencil />
                                                </Button>
                                            }
                                        />
                                        <Confirmacao
                                            gatilho={
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Excluir ${administracaoAtual.nome}`}
                                                    title="Excluir administração"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            }
                                            titulo={`Excluir ${administracaoAtual.nome}?`}
                                            descricao={
                                                daAdministracao.length > 0
                                                    ? `Ela organiza ${daAdministracao.length === 1 ? "1 competição" : `${daAdministracao.length} competições`}, e o servidor só exclui administração vazia. Exclua as competições primeiro.`
                                                    : "A administração não tem competições. Não dá para desfazer."
                                            }
                                            rotuloDaAcao="Excluir administração"
                                            aoConfirmar={async () => {
                                                try {
                                                    await removerAdministracao(administracaoAtual.id);
                                                    escolherAdministracao(null);
                                                    recarregar();
                                                    avisos.sucesso(`${administracaoAtual.nome} excluída.`);
                                                } catch (causa) {
                                                    avisos.erro(causa, "Não foi possível excluir");
                                                }
                                            }}
                                        />
                                        <CompeticaoDialog
                                            idAdministracao={administracaoAtual.id}
                                            aoSalvar={recarregar}
                                        />
                                    </>
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
                                        <CompeticaoDialog
                                            idAdministracao={administracaoAtual.id}
                                            aoSalvar={recarregar}
                                        />
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
                                                        <span className="min-w-0">
                                                            {competicao.nome}
                                                        </span>
                                                    </CardTitle>
                                                    {competicao.descricao && (
                                                        <CardDescription className="line-clamp-2">
                                                            {competicao.descricao}
                                                        </CardDescription>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                                        {competicao.estado && (
                                                            <Badge
                                                                variant={
                                                                    competicao.estado === "EM_ANDAMENTO"
                                                                        ? "default"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {ROTULO_DO_ESTADO[competicao.estado]}
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {[competicao.modalidade, competicao.categoria]
                                                                .filter(Boolean)
                                                                .join(" · ")}
                                                        </span>
                                                    </div>
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
