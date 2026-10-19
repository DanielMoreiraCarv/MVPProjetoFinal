"use client";

import { Printer, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import {
    CabecalhoDaPagina,
    CorpoDaPagina,
    migalhasDaCompeticao,
} from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { COLUNAS_DA_SUMULA, ultimoLancamento } from "@/src/features/sumula/eventos";
import { FolhaDaSumula } from "@/src/features/sumula/FolhaDaSumula";
import { PlacarDaSumula } from "@/src/features/sumula/PlacarDaSumula";
import { TabelaDoElenco } from "@/src/features/sumula/TabelaDoElenco";
import { listarElenco } from "@/src/lib/api/equipes";
import { buscarPartida } from "@/src/lib/api/partidas";
import {
    abrirSumula,
    buscarSumulaDaPartida,
    definirModoDaSumula,
    definirObservacoesDaSumula,
    definirPlacarDaSumula,
    encerrarSumula,
    registrarEvento,
    removerEvento,
    removerSumula,
} from "@/src/lib/api/sumulas";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";
import { formatarDataHora } from "@/src/lib/formato";
import { Atleta } from "@/src/lib/types/atleta";
import { Partida } from "@/src/lib/types/partida";
import { ModoDaSumula, Sumula, TipoDeEvento } from "@/src/lib/types/sumula";

/** A folha sai em A4 deitado, com a margem que impressora doméstica alcança. */
const PAGINA_A4_DEITADA = "@page { size: A4 landscape; margin: 10mm; }";

const HORA = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/**
 * Papel não tem tema escuro: com ele ligado, a folha sairia em letra clara
 * sobre papel branco. Imprime-se sempre no tema claro e devolve-se o que a
 * pessoa usava — inclusive pelo Ctrl+P, que não passa pelo botão.
 */
const useImpressaoClara = () => {
    useEffect(() => {
        const raiz = document.documentElement;
        let estavaEscuro = false;
        const antes = () => {
            estavaEscuro = raiz.classList.contains("dark");
            raiz.classList.remove("dark");
        };
        const depois = () => {
            if (estavaEscuro) raiz.classList.add("dark");
        };
        window.addEventListener("beforeprint", antes);
        window.addEventListener("afterprint", depois);
        return () => {
            window.removeEventListener("beforeprint", antes);
            window.removeEventListener("afterprint", depois);
        };
    }, []);
};

/**
 * A súmula da partida em dois modos. A completa é a padrão: o que cada atleta
 * fez, numa tabela por equipe, com o placar em cima que aceita também o gol
 * de que ninguém sabe o autor. A simplificada é só o placar. As duas saem em
 * PDF no formato da folha de papel.
 */
const SumulaPage = () => {
    const params = useParams<{ id: string; idPartida: string }>();
    const idCompeticao = Number(params?.id);
    const idPartida = Number(params?.idPartida);
    const { atual } = useEscopo();
    const avisos = useAvisos();
    useImpressaoClara();

    const [partida, setPartida] = useState<Partida | null>(null);
    const [sumula, setSumula] = useState<Sumula | null>(null);
    const [elencoMandante, setElencoMandante] = useState<Atleta[]>([]);
    const [elencoVisitante, setElencoVisitante] = useState<Atleta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const [abrindo, setAbrindo] = useState(false);
    const [corrigindo, setCorrigindo] = useState(false);
    const [pendente, setPendente] = useState<string | null>(null);
    const [mexendoNoPlacar, setMexendoNoPlacar] = useState(false);
    const [observacoes, setObservacoes] = useState("");

    const carregar = useCallback(() => {
        if (!Number.isFinite(idPartida)) return;
        setCarregando(true);
        setErro(null);
        Promise.all([buscarPartida(idPartida), buscarSumulaDaPartida(idPartida)])
            .then(async ([suaPartida, suaSumula]) => {
                const [doMandante, doVisitante] = await Promise.all([
                    suaPartida.idEquipeMandante ? listarElenco(suaPartida.idEquipeMandante) : [],
                    suaPartida.idEquipeVisitante ? listarElenco(suaPartida.idEquipeVisitante) : [],
                ]);
                setPartida(suaPartida);
                setSumula(suaSumula);
                setObservacoes(suaSumula?.observacoes ?? "");
                setElencoMandante(doMandante);
                setElencoVisitante(doVisitante);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idPartida]);

    useEffect(carregar, [carregar]);

    const executar = async (acao: () => Promise<Sumula>, sucesso?: string) => {
        try {
            setSumula(await acao());
            if (sucesso) avisos.sucesso(sucesso);
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const abrir = async (modo: ModoDaSumula) => {
        setAbrindo(true);
        await executar(() => abrirSumula(idPartida, modo), "Súmula aberta.");
        setAbrindo(false);
    };

    const tocar = async (atleta: Atleta, tipo: TipoDeEvento) => {
        if (!sumula) return;
        setPendente(`${atleta.id}-${tipo}`);
        if (corrigindo) {
            const alvo = ultimoLancamento(sumula.eventos, atleta.id, tipo);
            if (alvo) await executar(() => removerEvento(sumula.id, idPartida, alvo.id));
        } else {
            const antes = sumula.eventos.length;
            await executar(async () => {
                const atualizada = await registrarEvento(sumula.id, idPartida, atleta.id, tipo);
                if (atualizada.eventos.length > antes + 1) {
                    avisos.aviso(`${atleta.nome} recebeu o segundo amarelo: vermelho indireto lançado.`);
                }
                return atualizada;
            });
        }
        setPendente(null);
    };

    const mudarPlacar = async (mandante: number, visitante: number) => {
        if (!sumula) return;
        setMexendoNoPlacar(true);
        await executar(() => definirPlacarDaSumula(sumula.id, idPartida, mandante, visitante));
        setMexendoNoPlacar(false);
    };

    const golsComAutor = (doMandante: boolean) => {
        if (!sumula || !partida) return 0;
        const idDoLado = doMandante ? partida.idEquipeMandante : partida.idEquipeVisitante;
        return sumula.eventos.filter(
            (evento) =>
                (evento.tipo === "GOL" && evento.idEquipe === idDoLado) ||
                (evento.tipo === "GOL_CONTRA" && evento.idEquipe !== idDoLado),
        ).length;
    };

    const assinada = sumula?.assinada ?? false;
    const completa = sumula?.modo !== "SIMPLIFICADA";
    const recentes = sumula ? [...sumula.eventos].reverse().slice(0, 6) : [];
    const nomeDoTipo = (tipo: TipoDeEvento) =>
        COLUNAS_DA_SUMULA.find((coluna) => coluna.tipo === tipo)?.nome ?? tipo;

    return (
        <>
            <style>{PAGINA_A4_DEITADA}</style>
            <CabecalhoDaPagina
                conceito="sumula"
                titulo="Súmula"
                descricao={partida ? `${partida.equipeMandante} × ${partida.equipeVisitante}` : undefined}
                migalhas={migalhasDaCompeticao(
                    atual,
                    { rotulo: "Calendário", href: `/competicao/${idCompeticao}/partida` },
                    { rotulo: "Partida", href: `/competicao/${idCompeticao}/partida/${idPartida}` },
                )}
                acoes={
                    partida && (
                        <>
                            {sumula && (
                                <Badge variant={assinada ? "secondary" : "outline"}>
                                    {assinada ? "Assinada" : "Aberta"}
                                </Badge>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                                title="Abre a impressão: escolha “Salvar como PDF” no destino."
                            >
                                <Printer />
                                {sumula ? "Salvar PDF" : "Imprimir em branco"}
                            </Button>
                        </>
                    )
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : carregando || !partida ? (
                    <CarregandoLista linhas={6} />
                ) : (
                    <>
                        <div className="hidden print:block">
                            <FolhaDaSumula
                                partida={partida}
                                sumula={sumula}
                                atletasMandante={elencoMandante}
                                atletasVisitante={elencoVisitante}
                            />
                        </div>

                        <div className="space-y-6 print:hidden">
                            {!sumula ? (
                                <Vazio
                                    conceito="sumula"
                                    titulo="Esta partida ainda não tem súmula"
                                    descricao="A completa anota o que cada atleta fez — gol, cartão, falta — e o placar acompanha. A simplificada é só o placar. Dá para trocar depois."
                                    acao={
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <Button disabled={abrindo} onClick={() => abrir("COMPLETA")}>
                                                {abrindo ? "Aguarde…" : "Abrir súmula completa"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                disabled={abrindo}
                                                onClick={() => abrir("SIMPLIFICADA")}
                                            >
                                                Só o placar
                                            </Button>
                                        </div>
                                    }
                                />
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <ToggleGroup
                                            value={[sumula.modo]}
                                            onValueChange={(valor) =>
                                                valor.length > 0 &&
                                                valor[0] !== sumula.modo &&
                                                executar(() =>
                                                    definirModoDaSumula(
                                                        sumula.id,
                                                        idPartida,
                                                        valor[0] as ModoDaSumula,
                                                    ),
                                                )
                                            }
                                            variant="outline"
                                            disabled={assinada}
                                            aria-label="Modo da súmula"
                                        >
                                            <ToggleGroupItem value="COMPLETA">Completa</ToggleGroupItem>
                                            <ToggleGroupItem value="SIMPLIFICADA">Só o placar</ToggleGroupItem>
                                        </ToggleGroup>
                                        <p className="text-xs text-muted-foreground">
                                            Árbitro: {sumula.arbitro || partida.arbitro || "ninguém escalado"}
                                            {assinada &&
                                                ` · assinada em ${formatarDataHora(sumula.dataFechamento, "—")}`}
                                        </p>
                                    </div>

                                    <PlacarDaSumula
                                        mandante={partida.equipeMandante}
                                        visitante={partida.equipeVisitante}
                                        placarMandante={sumula.placarMandante}
                                        placarVisitante={sumula.placarVisitante}
                                        golsComAutorMandante={golsComAutor(true)}
                                        golsComAutorVisitante={golsComAutor(false)}
                                        editavel={!assinada}
                                        ocupado={mexendoNoPlacar}
                                        aoMudar={mudarPlacar}
                                    />

                                    {completa && (
                                        <>
                                            {!assinada && (
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Toque na célula para lançar. O gol no atleta soma no
                                                        placar; o + do placar é para gol sem autor.
                                                    </p>
                                                    <ToggleGroup
                                                        value={[corrigindo ? "corrigir" : "lancar"]}
                                                        onValueChange={(valor) =>
                                                            valor.length > 0 &&
                                                            setCorrigindo(valor[0] === "corrigir")
                                                        }
                                                        variant="outline"
                                                        aria-label="O que o toque faz"
                                                    >
                                                        <ToggleGroupItem value="lancar">Lançar</ToggleGroupItem>
                                                        <ToggleGroupItem value="corrigir">Corrigir</ToggleGroupItem>
                                                    </ToggleGroup>
                                                </div>
                                            )}

                                            <div className="grid gap-6 lg:grid-cols-2">
                                                <TabelaDoElenco
                                                    equipe={partida.equipeMandante}
                                                    atletas={elencoMandante}
                                                    eventos={sumula.eventos}
                                                    corrigindo={corrigindo}
                                                    editavel={!assinada}
                                                    pendente={pendente}
                                                    aoTocar={tocar}
                                                />
                                                <TabelaDoElenco
                                                    equipe={partida.equipeVisitante}
                                                    atletas={elencoVisitante}
                                                    eventos={sumula.eventos}
                                                    corrigindo={corrigindo}
                                                    editavel={!assinada}
                                                    pendente={pendente}
                                                    aoTocar={tocar}
                                                />
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {COLUNAS_DA_SUMULA.map(
                                                    (coluna) => `${coluna.sigla} ${coluna.nome.toLowerCase()}`,
                                                ).join(" · ")}
                                            </p>

                                            {recentes.length > 0 && (
                                                <Secao titulo="Últimos lançamentos">
                                                    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border">
                                                        {recentes.map((evento) => (
                                                            <li
                                                                key={evento.id}
                                                                className="flex items-center gap-3 px-4 py-2 text-sm"
                                                            >
                                                                <span className="numero-tabular w-12 shrink-0 font-mono text-xs text-muted-foreground">
                                                                    {HORA.format(new Date(evento.registradoEm))}
                                                                </span>
                                                                <span className="min-w-0 flex-1 truncate">
                                                                    {nomeDoTipo(evento.tipo)} — {evento.nomeAtleta}
                                                                    {evento.automatico && (
                                                                        <span className="text-muted-foreground">
                                                                            {" "}
                                                                            (automático)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                {!assinada && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon-sm"
                                                                        aria-label="Desfazer"
                                                                        title="Desfazer"
                                                                        onClick={() =>
                                                                            executar(() =>
                                                                                removerEvento(sumula.id, idPartida, evento.id),
                                                                            )
                                                                        }
                                                                    >
                                                                        <Undo2 />
                                                                    </Button>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Secao>
                                            )}
                                        </>
                                    )}

                                    {sumula.ocorrencias.length > 0 && (
                                        <Secao titulo="Ocorrências anotadas como texto">
                                            <ul className="space-y-1 rounded-3xl border border-border px-5 py-3 text-sm">
                                                {sumula.ocorrencias.map((texto, i) => (
                                                    <li key={i}>{texto}</li>
                                                ))}
                                            </ul>
                                        </Secao>
                                    )}

                                    <Secao titulo={assinada ? "Observações" : "Encerrar a súmula"}>
                                        <div className="space-y-4 rounded-3xl border border-border bg-card px-5 py-4">
                                            {assinada ? (
                                                <p className="text-sm">{sumula.observacoes || "Sem observações."}</p>
                                            ) : (
                                                <>
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label htmlFor="observacoes">Observações</Label>
                                                        <Textarea
                                                            id="observacoes"
                                                            rows={3}
                                                            className="min-h-24"
                                                            placeholder="Partida sem incidentes."
                                                            value={observacoes}
                                                            onChange={(evento) => setObservacoes(evento.target.value)}
                                                            // Guarda ao sair do campo: quem anota à beira do
                                                            // campo não lembra de apertar salvar.
                                                            onBlur={() =>
                                                                observacoes !== sumula.observacoes &&
                                                                executar(() =>
                                                                    definirObservacoesDaSumula(
                                                                        sumula.id,
                                                                        idPartida,
                                                                        observacoes,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <Confirmacao
                                                            gatilho={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 />
                                                                    Excluir súmula
                                                                </Button>
                                                            }
                                                            titulo="Excluir a súmula?"
                                                            descricao="Os lançamentos vão junto. A partida continua, e dá para abrir outra súmula depois."
                                                            rotuloDaAcao="Excluir súmula"
                                                            aoConfirmar={async () => {
                                                                try {
                                                                    await removerSumula(sumula.id);
                                                                    setSumula(null);
                                                                    avisos.sucesso("Súmula excluída.");
                                                                } catch (causa) {
                                                                    avisos.erro(causa, "Não foi possível excluir");
                                                                }
                                                            }}
                                                        />
                                                        <Confirmacao
                                                            gatilho={<Button size="lg">Encerrar e assinar</Button>}
                                                            titulo="Encerrar e assinar a súmula?"
                                                            descricao={`Fica valendo ${sumula.placarMandante} × ${sumula.placarVisitante}, e a partida termina com esse placar. Depois de assinada a súmula não aceita lançamento nem correção.`}
                                                            rotuloDaAcao="Encerrar e assinar"
                                                            destrutiva={false}
                                                            aoConfirmar={() =>
                                                                executar(
                                                                    () =>
                                                                        encerrarSumula(
                                                                            sumula.id,
                                                                            sumula.placarMandante,
                                                                            sumula.placarVisitante,
                                                                            observacoes.trim(),
                                                                            idPartida,
                                                                        ),
                                                                    "Súmula assinada. A partida foi encerrada com esse placar.",
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Secao>
                                </>
                            )}

                            <Button
                                variant="outline"
                                className="w-full"
                                nativeButton={false}
                                render={<Link href={`/competicao/${idCompeticao}/partida/${idPartida}`} />}
                            >
                                Voltar à partida
                            </Button>
                        </div>
                    </>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default SumulaPage;
