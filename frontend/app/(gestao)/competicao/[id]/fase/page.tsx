"use client";

import { ArrowRight, Check, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import {
    CabecalhoDaPagina,
    CorpoDaPagina,
    migalhasDaCompeticao,
} from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { ConfiguracaoDaFase } from "@/src/features/fases/ConfiguracaoDaFase";
import { ConfrontosDaFase } from "@/src/features/fases/ConfrontosDaFase";
import { FaseDialog } from "@/src/features/fases/FaseDialog";
import {
    Fase,
    ROTULO_DO_FORMATO,
    listarFasesDaCompeticao,
    removerFase,
} from "@/src/lib/api/fases";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";
import { ICONES } from "@/src/lib/icones";

/**
 * As fases de uma competição: a lista à esquerda, a fase escolhida à direita.
 *
 * A fase não é uma linha de cadastro — ela tem configuração, validação e
 * geração de confrontos. Empilhar isso dentro de cada item da lista dava uma
 * página que rolava sem fim; escolher à esquerda e trabalhar à direita é o
 * mesmo gesto da página de competições.
 */
const FasesPage = () => {
    const params = useParams<{ id: string }>();
    const idCompeticao = Number(params?.id);
    const { atual } = useEscopo();
    const avisos = useAvisos();

    const [fases, setFases] = useState<Fase[]>([]);
    const [escolhida, setEscolhida] = useState<number | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);
    // Gravar configuração invalida a validação que está na tela.
    const [versaoDaConfiguracao, setVersaoDaConfiguracao] = useState(0);

    const carregar = useCallback(() => {
        if (!Number.isFinite(idCompeticao)) return;
        setCarregando(true);
        setErro(null);
        listarFasesDaCompeticao(idCompeticao)
            .then((lista) => {
                setFases(lista);
                setEscolhida((anterior) =>
                    anterior && lista.some((fase) => fase.id === anterior)
                        ? anterior
                        : // A primeira da competição, e não a primeira que a API
                          // devolveu — o modelo cria de trás para frente.
                          ([...lista].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id)[0]?.id ??
                          null),
                );
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idCompeticao]);

    useEffect(carregar, [carregar]);

    // A ordem é da competição, não da chegada no banco.
    const emOrdem = useMemo(
        () => [...fases].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id),
        [fases],
    );

    const fase = emOrdem.find((cada) => cada.id === escolhida) ?? null;
    const nomeDaFase = (id?: number) => fases.find((cada) => cada.id === id)?.nome;

    const IconeFase = ICONES.fase;
    const inscritas = atual?.equipes.length ?? 0;

    const excluir = async (alvo: Fase) => {
        try {
            await removerFase(alvo.id);
            avisos.sucesso(`${alvo.nome} foi excluída.`);
            carregar();
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    return (
        <>
            <CabecalhoDaPagina
                conceito="fase"
                titulo="Fases"
                descricao="Cada fase decide como os confrontos são montados e quantas equipes seguem."
                migalhas={migalhasDaCompeticao(atual)}
                acoes={
                    <FaseDialog
                        idCompeticao={idCompeticao}
                        fases={emOrdem}
                        equipesInscritas={inscritas}
                        aoSalvar={carregar}
                    />
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : !carregando && emOrdem.length === 0 ? (
                    // Sem fase, dois painéis vazios lado a lado não diziam nada
                    // a mais que um — e desalinhavam, porque só um tinha título.
                    <Vazio
                        conceito="fase"
                        titulo="Nenhuma fase ainda"
                        descricao={`A competição precisa de ao menos uma fase para ter confrontos. Comece pela primeira: as ${inscritas} equipes inscritas entram nela.`}
                        acao={
                            <FaseDialog
                                idCompeticao={idCompeticao}
                                fases={emOrdem}
                                equipesInscritas={inscritas}
                                aoSalvar={carregar}
                            />
                        }
                    />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Secao titulo="Fases da competição">
                            {carregando ? (
                                <CarregandoLista linhas={3} />
                            ) : (
                                <div className="space-y-2">
                                    {emOrdem.map((cada) => {
                                        const selecionada = cada.id === escolhida;

                                        return (
                                            <button
                                                key={cada.id}
                                                type="button"
                                                aria-pressed={selecionada}
                                                onClick={() => setEscolhida(cada.id)}
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
                                                        <IconeFase className="size-4" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1 space-y-0.5">
                                                    <span className="flex items-baseline gap-2">
                                                        <span className="numero-tabular font-mono text-xs text-muted-foreground">
                                                            {cada.ordem ?? "—"}
                                                        </span>
                                                        <span className="min-w-0 flex-1 truncate font-medium">
                                                            {cada.nome}
                                                        </span>
                                                    </span>
                                                    <span className="block text-sm text-muted-foreground">
                                                        {cada.formato
                                                            ? ROTULO_DO_FORMATO[cada.formato]
                                                            : "Formato não informado"}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {cada.entram !== undefined && `${cada.entram} entram`}
                                                        {cada.avancam !== undefined &&
                                                            ` · ${cada.avancam === cada.entram ? "todas seguem" : `${cada.avancam} avançam`}`}
                                                    </span>
                                                    {cada.idFaseSucessora && (
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <ArrowRight className="size-3 shrink-0" />
                                                            {nomeDaFase(cada.idFaseSucessora) ??
                                                                `fase ${cada.idFaseSucessora}`}
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </Secao>

                        <div className="space-y-6 lg:col-span-2">
                            {carregando ? (
                                <CarregandoLista linhas={4} />
                            ) : !fase ? (
                                <Vazio
                                    conceito="fase"
                                    titulo="Escolha uma fase"
                                    descricao="A configuração, a validação e a geração de confrontos são de uma fase por vez."
                                />
                            ) : (
                                <>
                                    <Secao
                                        titulo={fase.nome}
                                        acao={
                                            <span className="flex items-center gap-2">
                                                {fase.formato && (
                                                    <Badge variant="secondary">
                                                        {ROTULO_DO_FORMATO[fase.formato]}
                                                    </Badge>
                                                )}
                                                <FaseDialog
                                                    idCompeticao={idCompeticao}
                                                    fase={fase}
                                                    fases={emOrdem}
                                                    equipesInscritas={inscritas}
                                                    aoSalvar={carregar}
                                                />
                                                <Confirmacao
                                                    gatilho={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            aria-label={`Excluir a fase ${fase.nome}`}
                                                            title="Excluir fase"
                                                        >
                                                            <Trash2 />
                                                        </Button>
                                                    }
                                                    titulo={`Excluir a fase ${fase.nome}?`}
                                                    // Diz o que NÃO acontece: a
                                                    // competição e as equipes
                                                    // inscritas ficam.
                                                    descricao={`Os confrontos gerados por ela vão junto. A competição, as equipes inscritas e as outras fases continuam${
                                                        emOrdem.find((cada) => cada.idFaseSucessora === fase.id)
                                                            ? ` — ${emOrdem.find((cada) => cada.idFaseSucessora === fase.id)?.nome} deixa de levar a ela`
                                                            : ""
                                                    }.`}
                                                    rotuloDaAcao="Excluir fase"
                                                    aoConfirmar={() => excluir(fase)}
                                                />
                                            </span>
                                        }
                                    >
                                        <ConfrontosDaFase
                                            idFase={fase.id}
                                            idCompeticao={idCompeticao}
                                            versaoDaConfiguracao={versaoDaConfiguracao}
                                        />
                                    </Secao>

                                    <Secao titulo="Configuração da fase">
                                        {/* A chave amarra o estado do formulário
                                            à fase: sem ela, trocar de fase
                                            reaproveitava o rascunho da anterior. */}
                                        <ConfiguracaoDaFase
                                            key={`${fase.id}-${fase.classificados ?? ""}`}
                                            idFase={fase.id}
                                            fase={fase}
                                            idCompeticao={idCompeticao}
                                            aoGravar={() => {
                                                setVersaoDaConfiguracao((versao) => versao + 1);
                                                carregar();
                                            }}
                                        />
                                    </Secao>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default FasesPage;
