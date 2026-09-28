"use client";

import {
    ArrowDown,
    CircleAlert,
    CircleCheck,
    Lock,
    Plus,
    Rocket,
    Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoCartoes, Erro, Vazio } from "@/src/components/estado/Estados";
import { ConfiguracaoDaFase } from "@/src/features/estrutura/ConfiguracaoDaFase";
import { MODELOS, ModeloDeCompeticao } from "@/src/features/estrutura/modelos";
import { buscarCompeticao, mudarEstadoDaCompeticao } from "@/src/lib/api/competicoes";
import {
    Fase,
    FORMATOS_DE_FASE,
    FormatoDeFase,
    ROTULO_DO_FORMATO,
    ValidacaoDaFase,
    atualizarFase,
    criarFase,
    definirAtributoDaFase,
    gerarConfrontosDaFase,
    listarFasesDaCompeticao,
    removerFase,
    validarFase,
} from "@/src/lib/api/fases";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";
import { ICONES } from "@/src/lib/icones";
import { Competicao, ROTULO_DO_ESTADO } from "@/src/lib/types/competicao";

/**
 * O construtor de competição personalizada.
 *
 * Uma competição é uma sequência de fases encadeadas, e o motor do servidor
 * aceita misturar formatos porque a entrada e a saída de toda fase é a mesma
 * coisa — uma classificação. Grupos alimentando eliminatória, pontos corridos
 * alimentando semifinal: o que o regulamento pedir.
 *
 * A estrutura só é editável enquanto a competição está em RASCUNHO. Depois de
 * publicada, mexer nela invalidaria confrontos já gerados e classificação já
 * calculada.
 */

const Secao = ({
    titulo,
    descricao,
    acao,
    children,
}: {
    titulo: string;
    descricao?: string;
    acao?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <section className="space-y-3">
        <div className="flex min-h-9 items-start justify-between gap-3">
            <div className="space-y-0.5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {titulo}
                </h2>
                {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
            </div>
            {acao}
        </div>
        {children}
    </section>
);

const EstruturaPage = () => {
    const params = useParams<{ id: string }>();
    const idCompeticao = Number(params?.id);
    const { atual, recarregar: recarregarEscopo } = useEscopo();
    const avisos = useAvisos();

    const [competicao, setCompeticao] = useState<Competicao | null>(null);
    const [fases, setFases] = useState<Fase[]>([]);
    const [validacoes, setValidacoes] = useState<Record<number, ValidacaoDaFase>>({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);
    const [trabalhando, setTrabalhando] = useState(false);

    const IconeFase = ICONES.fase;

    const ordenadas = useMemo(
        () => [...fases].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
        [fases],
    );

    const editavel = competicao?.estado === "RASCUNHO" || competicao?.estado === undefined;

    const revalidar = useCallback(async (lista: Fase[]) => {
        const resultados = await Promise.all(
            lista.map((fase) =>
                validarFase(fase.id)
                    .then((v) => [fase.id, v] as const)
                    .catch(() => [fase.id, { valido: false, erros: [] }] as const),
            ),
        );
        setValidacoes(Object.fromEntries(resultados));
    }, []);

    const carregar = useCallback(() => {
        setCarregando(true);
        setErro(null);
        Promise.all([buscarCompeticao(idCompeticao), listarFasesDaCompeticao(idCompeticao)])
            .then(async ([encontrada, suasFases]) => {
                setCompeticao(encontrada);
                setFases(suasFases);
                await revalidar(suasFases);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idCompeticao, revalidar]);

    useEffect(carregar, [carregar]);

    /* ------------------------------------------------------ montar ------- */

    const adicionarFase = async (formato: FormatoDeFase) => {
        setTrabalhando(true);
        try {
            const ordem = (ordenadas.at(-1)?.ordem ?? 0) + 1;
            const nova = await criarFase({
                nome: ROTULO_DO_FORMATO[formato],
                ordem,
                fasePartida: formato,
                idCompeticao,
            });

            // A fase anterior passa a alimentar esta: é o encadeamento que
            // permite misturar formatos.
            const anterior = ordenadas.at(-1);
            if (anterior) {
                await atualizarFase(anterior.id, {
                    nome: anterior.nome,
                    ordem: anterior.ordem ?? 1,
                    fasePartida: anterior.formato ?? "PONTOS_CORRIDOS",
                    idCompeticao,
                    qtdClassificados: anterior.classificados,
                    idFaseSucessora: nova.id,
                });
            }

            avisos.sucesso(`${ROTULO_DO_FORMATO[formato]} adicionada.`);
            carregar();
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setTrabalhando(false);
        }
    };

    const aplicarModelo = async (modelo: ModeloDeCompeticao) => {
        setTrabalhando(true);
        try {
            // Cria de trás para frente, para cada fase já nascer sabendo a
            // sucessora — evita um segundo passe de atualização.
            let sucessora: number | undefined;

            for (let i = modelo.fases.length - 1; i >= 0; i--) {
                const molde = modelo.fases[i];
                const criada = await criarFase({
                    nome: molde.nome,
                    ordem: i + 1,
                    fasePartida: molde.formato,
                    idCompeticao,
                    qtdClassificados: molde.classificados,
                    idFaseSucessora: sucessora,
                });

                for (const [codigo, valor] of Object.entries(molde.atributos ?? {})) {
                    await definirAtributoDaFase(criada.id, codigo, valor);
                }

                sucessora = criada.id;
            }

            avisos.sucesso(`Estrutura de "${modelo.nome}" criada.`);
            carregar();
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setTrabalhando(false);
        }
    };

    const excluirFase = async (fase: Fase) => {
        try {
            await removerFase(fase.id);
            avisos.sucesso(`${fase.nome} removida.`);
            carregar();
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const renomear = async (fase: Fase, nome: string, classificados?: number) => {
        try {
            await atualizarFase(fase.id, {
                nome,
                ordem: fase.ordem ?? 1,
                fasePartida: fase.formato ?? "PONTOS_CORRIDOS",
                idCompeticao,
                qtdClassificados: classificados,
                idFaseSucessora: fase.idFaseSucessora,
            });
            carregar();
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    /* --------------------------------------------------- publicar -------- */

    /**
     * Publicar exige a PRIMEIRA fase pronta, não todas.
     *
     * A entrada de uma fase é a classificação da anterior, então uma fase
     * seguinte só tem o que validar depois que a anterior produziu resultado —
     * antes disso ela recebe zero equipes e reprova. Exigir todas válidas
     * tornaria impossível publicar qualquer competição de mais de uma fase.
     */
    const primeira = ordenadas[0];
    const podePublicar = Boolean(primeira && validacoes[primeira.id]?.valido);

    const publicar = async () => {
        setTrabalhando(true);
        try {
            await mudarEstadoDaCompeticao(idCompeticao, "EM_ANDAMENTO");

            // A primeira fase recebe as equipes inscritas; gerar os confrontos
            // dela é o que torna a competição jogável. As seguintes são
            // montadas quando a anterior terminar e houver classificação.
            if (primeira) {
                const quantos = await gerarConfrontosDaFase(primeira.id);
                avisos.sucesso(
                    `Competição publicada. ${quantos} confronto${quantos === 1 ? "" : "s"} gerado${quantos === 1 ? "" : "s"} em ${primeira.nome}.`,
                );
            } else {
                avisos.sucesso("Competição publicada.");
            }

            recarregarEscopo();
            carregar();
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setTrabalhando(false);
        }
    };

    /* ------------------------------------------------------ render ------- */

    return (
        <>
            <CabecalhoDaPagina
                conceito="estrutura"
                titulo="Estrutura"
                descricao={
                    competicao
                        ? `Como ${competicao.nome} é disputada`
                        : "Monte a sequência de fases da competição."
                }
                migalhas={[
                    { rotulo: "Competições", href: "/competicao" },
                    ...(atual ? [{ rotulo: atual.nome, href: `/competicao/${idCompeticao}` }] : []),
                    { rotulo: "Estrutura" },
                ]}
                acoes={
                    <>
                        {competicao?.estado && (
                            <Badge
                                variant={
                                    competicao.estado === "EM_ANDAMENTO"
                                        ? "default"
                                        : competicao.estado === "CANCELADA"
                                          ? "destructive"
                                          : "secondary"
                                }
                            >
                                {ROTULO_DO_ESTADO[competicao.estado]}
                            </Badge>
                        )}
                        {editavel && ordenadas.length > 0 && (
                            <Confirmacao
                                gatilho={
                                    <Button size="sm" disabled={!podePublicar || trabalhando}>
                                        <Rocket />
                                        Publicar
                                    </Button>
                                }
                                titulo="Publicar a competição?"
                                descricao="Os confrontos da primeira fase são gerados e a estrutura deixa de ser editável. A competição passa a estar em andamento."
                                rotuloDaAcao="Publicar competição"
                                destrutiva={false}
                                aoConfirmar={publicar}
                            />
                        )}
                    </>
                }
            />

            <CorpoDaPagina className="space-y-6">
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : carregando ? (
                    <CarregandoCartoes cartoes={3} />
                ) : (
                    <>
                        {!editavel && (
                            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                                <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    A competição está{" "}
                                    <strong className="text-foreground">
                                        {competicao?.estado
                                            ? ROTULO_DO_ESTADO[competicao.estado].toLowerCase()
                                            : "publicada"}
                                    </strong>
                                    , então a estrutura é só leitura. Mexer nela agora
                                    invalidaria os confrontos já gerados e a classificação já
                                    calculada.
                                </p>
                            </div>
                        )}

                        {ordenadas.length === 0 ? (
                            <Secao
                                titulo="Comece por um modelo"
                                descricao="Cada um cria as fases já encadeadas e configuradas. Daí em diante tudo é editável."
                            >
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {MODELOS.map((modelo) => (
                                        <button
                                            key={modelo.chave}
                                            type="button"
                                            disabled={!editavel || trabalhando}
                                            onClick={() => aplicarModelo(modelo)}
                                            className={cn(
                                                "flex h-full flex-col gap-2 rounded-2xl border border-border p-4 text-left transition-colors",
                                                editavel
                                                    ? "hover:border-ring"
                                                    : "cursor-not-allowed opacity-60",
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                                    <IconeFase className="size-4" />
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {modelo.nome}
                                                </span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {modelo.descricao}
                                            </span>
                                            <span className="mt-auto flex flex-wrap gap-1 pt-1">
                                                {modelo.fases.map((fase, i) => (
                                                    <Badge key={i} variant="outline">
                                                        {ROTULO_DO_FORMATO[fase.formato]}
                                                    </Badge>
                                                ))}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {modelo.exige}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <Vazio
                                    conceito="fase"
                                    titulo="Ou monte do zero"
                                    descricao="Adicione a primeira fase e escolha o formato dela."
                                    acao={
                                        editavel && (
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {FORMATOS_DE_FASE.map((formato) => (
                                                    <Button
                                                        key={formato}
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={trabalhando}
                                                        onClick={() => adicionarFase(formato)}
                                                    >
                                                        <Plus />
                                                        {ROTULO_DO_FORMATO[formato]}
                                                    </Button>
                                                ))}
                                            </div>
                                        )
                                    }
                                />
                            </Secao>
                        ) : (
                            <Secao
                                titulo="A sequência de fases"
                                descricao="A classificação de uma alimenta a seguinte. É o que permite misturar formatos."
                                acao={
                                    editavel && (
                                        <div className="flex flex-wrap gap-1">
                                            {FORMATOS_DE_FASE.map((formato) => (
                                                <Button
                                                    key={formato}
                                                    size="xs"
                                                    variant="outline"
                                                    disabled={trabalhando}
                                                    onClick={() => adicionarFase(formato)}
                                                >
                                                    <Plus />
                                                    {ROTULO_DO_FORMATO[formato]}
                                                </Button>
                                            ))}
                                        </div>
                                    )
                                }
                            >
                                <div className="space-y-2">
                                    {ordenadas.map((fase, indice) => {
                                        const validacao = validacoes[fase.id];
                                        const ultima = indice === ordenadas.length - 1;

                                        return (
                                            <div key={fase.id} className="space-y-2">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-start justify-between gap-3 text-sm">
                                                            <span className="flex min-w-0 items-center gap-2">
                                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground">
                                                                    {indice + 1}
                                                                </span>
                                                                <span className="min-w-0 truncate">
                                                                    {fase.nome}
                                                                </span>
                                                            </span>
                                                            <span className="flex shrink-0 items-center gap-1">
                                                                <Badge variant="secondary">
                                                                    {fase.formato
                                                                        ? ROTULO_DO_FORMATO[
                                                                              fase.formato
                                                                          ]
                                                                        : "—"}
                                                                </Badge>
                                                                {editavel && (
                                                                    <Confirmacao
                                                                        gatilho={
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon-xs"
                                                                                aria-label={`Remover ${fase.nome}`}
                                                                            >
                                                                                <Trash2 />
                                                                            </Button>
                                                                        }
                                                                        titulo={`Remover ${fase.nome}?`}
                                                                        descricao="Os confrontos gerados por esta fase saem junto. As equipes inscritas na competição ficam."
                                                                        rotuloDaAcao="Remover fase"
                                                                        aoConfirmar={() =>
                                                                            excluirFase(fase)
                                                                        }
                                                                    />
                                                                )}
                                                            </span>
                                                        </CardTitle>

                                                        {validacao && indice > 0 && !validacao.valido ? (
                                                            <CardDescription className="flex items-start gap-1.5">
                                                                <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
                                                                <span>
                                                                    Será montada quando{" "}
                                                                    {ordenadas[indice - 1].nome}{" "}
                                                                    terminar e houver
                                                                    classificação para alimentá-la.
                                                                </span>
                                                            </CardDescription>
                                                        ) : validacao ? (
                                                            <CardDescription
                                                                className={cn(
                                                                    "flex items-start gap-1.5",
                                                                    validacao.valido
                                                                        ? "text-success"
                                                                        : "text-destructive",
                                                                )}
                                                            >
                                                                {validacao.valido ? (
                                                                    <>
                                                                        <CircleCheck className="mt-0.5 size-3.5 shrink-0" />
                                                                        Pronta para gerar os
                                                                        confrontos
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
                                                                        <span>
                                                                            {validacao.erros
                                                                                .length > 0
                                                                                ? validacao.erros.join(
                                                                                      "; ",
                                                                                  )
                                                                                : "Ainda não dá para montar esta fase."}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </CardDescription>
                                                        ) : null}
                                                    </CardHeader>

                                                    <CardContent className="space-y-4">
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div className="space-y-1.5">
                                                                <Label
                                                                    htmlFor={`nome-${fase.id}`}
                                                                >
                                                                    Nome da fase
                                                                </Label>
                                                                <Input
                                                                    id={`nome-${fase.id}`}
                                                                    defaultValue={fase.nome}
                                                                    disabled={!editavel}
                                                                    onBlur={(evento) => {
                                                                        const nome =
                                                                            evento.target.value.trim();
                                                                        if (
                                                                            nome &&
                                                                            nome !== fase.nome
                                                                        ) {
                                                                            renomear(
                                                                                fase,
                                                                                nome,
                                                                                fase.classificados,
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </div>

                                                            {!ultima && (
                                                                <div className="space-y-1.5">
                                                                    <Label
                                                                        htmlFor={`classificados-${fase.id}`}
                                                                    >
                                                                        Classificados
                                                                    </Label>
                                                                    <Input
                                                                        id={`classificados-${fase.id}`}
                                                                        type="number"
                                                                        min={1}
                                                                        defaultValue={
                                                                            fase.classificados ??
                                                                            ""
                                                                        }
                                                                        disabled={!editavel}
                                                                        onBlur={(evento) => {
                                                                            const valor = Number(
                                                                                evento.target
                                                                                    .value,
                                                                            );
                                                                            if (
                                                                                valor !==
                                                                                fase.classificados
                                                                            ) {
                                                                                renomear(
                                                                                    fase,
                                                                                    fase.nome,
                                                                                    valor || undefined,
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Quantos avançam para a
                                                                        fase seguinte.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <ConfiguracaoDaFase
                                                            idFase={fase.id}
                                                            editavel={editavel}
                                                            aoMudar={() => revalidar(fases)}
                                                        />
                                                    </CardContent>
                                                </Card>

                                                {!ultima && (
                                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                        <ArrowDown className="size-3.5" />
                                                        <span>
                                                            {fase.classificados
                                                                ? `os ${fase.classificados} primeiros avançam`
                                                                : "os classificados avançam"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {editavel && (
                                    <p className="text-xs text-muted-foreground">
                                        {podePublicar
                                            ? "Publicar gera os confrontos da primeira fase. As seguintes são montadas quando a anterior terminar e houver classificação para alimentá-las."
                                            : "Publicar fica disponível quando a primeira fase estiver pronta. Quem decide é o servidor, que conhece a estratégia de cada formato."}
                                    </p>
                                )}
                            </Secao>
                        )}
                    </>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default EstruturaPage;
