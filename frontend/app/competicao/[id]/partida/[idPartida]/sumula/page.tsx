"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import {
    CabecalhoDaPagina,
    CorpoDaPagina,
    migalhasDaCompeticao,
} from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { buscarPartida } from "@/src/lib/api/partidas";
import {
    abrirSumula,
    buscarSumulaDaPartida,
    encerrarSumula,
    registrarOcorrencia,
    removerSumula,
    salvarSumula,
} from "@/src/lib/api/sumulas";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";
import { formatarDataHora } from "@/src/lib/formato";
import { Partida } from "@/src/lib/types/partida";
import { Sumula } from "@/src/lib/types/sumula";

/**
 * A súmula, pensada para o celular à beira do campo: uma coluna só, alvo de
 * toque grande e a ação principal — registrar ocorrência — no fim da página,
 * onde o polegar alcança.
 *
 * Ocorrência é texto livre, e é assim de propósito: a API não tem entidade de
 * evento, então não há onde guardar gol com atleta e minuto. Um formulário de
 * gol/cartão aqui escreveria os campos numa frase e perderia todos eles.
 */
const SumulaPage = () => {
    const params = useParams<{ id: string; idPartida: string }>();
    const idCompeticao = Number(params?.id);
    const idPartida = Number(params?.idPartida);
    const { atual } = useEscopo();
    const avisos = useAvisos();

    const [partida, setPartida] = useState<Partida | null>(null);
    const [sumula, setSumula] = useState<Sumula | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const [abrindo, setAbrindo] = useState(false);
    const [ocorrencia, setOcorrencia] = useState("");
    const [registrando, setRegistrando] = useState(false);
    const [placarMandante, setPlacarMandante] = useState("0");
    const [placarVisitante, setPlacarVisitante] = useState("0");
    const [observacoes, setObservacoes] = useState("");

    const carregar = () => {
        if (!Number.isFinite(idPartida)) return;
        setCarregando(true);
        setErro(null);
        Promise.all([buscarPartida(idPartida), buscarSumulaDaPartida(idPartida)])
            .then(([suaPartida, suaSumula]) => {
                setPartida(suaPartida);
                setSumula(suaSumula);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, [idPartida]);

    // Os campos do fechamento partem do que já está registrado: a súmula abre
    // zerada e o placar da partida é o palpite mais próximo do final.
    useEffect(() => {
        if (!sumula) return;
        const mandante = sumula.placarMandante || partida?.placarMandante || 0;
        const visitante = sumula.placarVisitante || partida?.placarVisitante || 0;
        setPlacarMandante(String(mandante));
        setPlacarVisitante(String(visitante));
        setObservacoes(sumula.observacoes);
    }, [sumula, partida?.placarMandante, partida?.placarVisitante]);

    const abrir = async () => {
        setAbrindo(true);
        try {
            setSumula(await abrirSumula(idPartida));
            avisos.sucesso("Súmula aberta.");
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setAbrindo(false);
        }
    };

    const registrar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        if (!sumula || !ocorrencia.trim()) return;
        setRegistrando(true);
        try {
            setSumula(await registrarOcorrencia(sumula.id, ocorrencia.trim(), idPartida));
            setOcorrencia("");
            avisos.sucesso("Ocorrência registrada.");
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setRegistrando(false);
        }
    };

    const encerrar = async () => {
        if (!sumula) return;
        try {
            setSumula(
                await encerrarSumula(
                    sumula.id,
                    Number(placarMandante),
                    Number(placarVisitante),
                    observacoes.trim(),
                    idPartida,
                ),
            );
            avisos.sucesso("Súmula encerrada e assinada.");
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const [salvando, setSalvando] = useState(false);

    const salvarSemAssinar = async () => {
        if (!sumula) return;
        setSalvando(true);
        try {
            setSumula(
                await salvarSumula(
                    sumula.id,
                    Number(placarMandante),
                    Number(placarVisitante),
                    observacoes.trim(),
                    idPartida,
                ),
            );
            avisos.sucesso("Súmula salva. Ela continua aberta.");
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async () => {
        if (!sumula) return;
        try {
            await removerSumula(sumula.id);
            setSumula(null);
            avisos.sucesso("Súmula excluída.");
        } catch (causa) {
            avisos.erro(causa, "Não foi possível excluir");
        }
    };

    const assinada = sumula?.assinada ?? false;

    return (
        <>
            <CabecalhoDaPagina
                conceito="sumula"
                titulo="Súmula"
                descricao={
                    partida
                        ? `${partida.equipeMandante} × ${partida.equipeVisitante}`
                        : undefined
                }
                migalhas={migalhasDaCompeticao(
                    atual,
                    { rotulo: "Calendário", href: `/competicao/${idCompeticao}/partida` },
                    { rotulo: "Partida", href: `/competicao/${idCompeticao}/partida/${idPartida}` },
                )}
                acoes={
                    sumula && (
                        <Badge variant={assinada ? "secondary" : "outline"}>
                            {assinada ? "Assinada" : "Aberta"}
                        </Badge>
                    )
                }
            />
            <CorpoDaPagina className="max-w-xl">
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : carregando ? (
                    <CarregandoLista linhas={4} />
                ) : !sumula ? (
                    <Vazio
                        conceito="sumula"
                        titulo="Esta partida ainda não tem súmula"
                        descricao="Abrir a súmula é o que permite registrar ocorrências durante o jogo. Ela herda o árbitro escalado para a partida."
                        acao={
                            <Button size="lg" disabled={abrindo} onClick={abrir}>
                                {abrindo ? "Aguarde…" : "Abrir súmula"}
                            </Button>
                        }
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4 rounded-3xl border border-border px-5 py-5">
                            <div className="flex items-center justify-center gap-4">
                                <p className="min-w-0 flex-1 text-right text-sm font-medium">
                                    {partida?.equipeMandante}
                                </p>
                                <p className="numero-tabular shrink-0 font-mono text-3xl font-bold">
                                    {sumula.placarMandante}
                                    <span className="px-2 text-muted-foreground">×</span>
                                    {sumula.placarVisitante}
                                </p>
                                <p className="min-w-0 flex-1 text-left text-sm font-medium">
                                    {partida?.equipeVisitante}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                                <span>Árbitro: {sumula.arbitro || "ninguém escalado"}</span>
                                <span>
                                    {assinada
                                        ? `Encerrada em ${formatarDataHora(sumula.dataFechamento, "—")}`
                                        : "Em aberto"}
                                </span>
                            </div>
                        </div>

                        <Secao titulo="Ocorrências">
                            {sumula.ocorrencias.length === 0 ? (
                                <Vazio
                                    conceito="sumula"
                                    titulo="Nenhuma ocorrência registrada"
                                    descricao="Tudo o que aconteceu em campo e merece registro entra aqui, com as palavras de quem apita."
                                />
                            ) : (
                                <ol className="space-y-2">
                                    {sumula.ocorrencias.map((relato, i) => (
                                        <li
                                            key={i}
                                            className="flex gap-3 rounded-3xl border border-border px-5 py-3"
                                        >
                                            <span className="numero-tabular shrink-0 font-mono text-sm text-muted-foreground">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span className="min-w-0 flex-1 text-sm">
                                                {relato}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </Secao>

                        {assinada ? (
                            <Secao titulo="Observações">
                                <p className="rounded-3xl border border-border px-5 py-3 text-sm">
                                    {sumula.observacoes || "Sem observações."}
                                </p>
                            </Secao>
                        ) : (
                            <>
                                <Secao titulo="Registrar ocorrência">
                                    <form
                                        onSubmit={registrar}
                                        className="space-y-3 rounded-3xl border border-border px-5 py-4"
                                    >
                                        <Label htmlFor="ocorrencia">
                                            O que aconteceu, em suas palavras
                                        </Label>
                                        <Textarea
                                            id="ocorrencia"
                                            rows={3}
                                            className="min-h-24"
                                            placeholder="Gol de João Victor aos 12 do primeiro tempo."
                                            value={ocorrencia}
                                            onChange={(evento) =>
                                                setOcorrencia(evento.target.value)
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            A ocorrência é um relato em texto: fica guardada como
                                            foi escrita. Não há campo de atleta nem de minuto —
                                            artilharia e contagem de cartão dependem de uma
                                            entidade de evento que a API ainda não tem.
                                        </p>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="h-12 w-full"
                                            disabled={registrando || !ocorrencia.trim()}
                                        >
                                            {registrando ? "Aguarde…" : "Registrar ocorrência"}
                                        </Button>
                                    </form>
                                </Secao>

                                <Secao titulo="Encerrar a súmula">
                                    <div className="space-y-4 rounded-3xl border border-border px-5 py-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <Label htmlFor="final-mandante">
                                                    {partida?.equipeMandante ?? "Mandante"}
                                                </Label>
                                                <Input
                                                    id="final-mandante"
                                                    type="number"
                                                    min={0}
                                                    inputMode="numeric"
                                                    className="numero-tabular h-12 font-mono text-lg"
                                                    value={placarMandante}
                                                    onChange={(evento) =>
                                                        setPlacarMandante(evento.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label htmlFor="final-visitante">
                                                    {partida?.equipeVisitante ?? "Visitante"}
                                                </Label>
                                                <Input
                                                    id="final-visitante"
                                                    type="number"
                                                    min={0}
                                                    inputMode="numeric"
                                                    className="numero-tabular h-12 font-mono text-lg"
                                                    value={placarVisitante}
                                                    onChange={(evento) =>
                                                        setPlacarVisitante(evento.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="observacoes">Observações</Label>
                                            <Textarea
                                                id="observacoes"
                                                rows={3}
                                                className="min-h-24"
                                                placeholder="Partida sem incidentes."
                                                value={observacoes}
                                                onChange={(evento) =>
                                                    setObservacoes(evento.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="h-12"
                                                disabled={salvando}
                                                onClick={salvarSemAssinar}
                                            >
                                                {salvando ? "Salvando…" : "Salvar sem assinar"}
                                            </Button>
                                            <Confirmacao
                                                gatilho={
                                                    <Button size="lg" className="h-12">
                                                        Encerrar e assinar
                                                    </Button>
                                                }
                                                titulo="Encerrar e assinar a súmula?"
                                                descricao={`Fica valendo ${placarMandante} × ${placarVisitante}. Depois de assinada a súmula não aceita nova ocorrência, nem correção de placar ou de observação — não dá para reabrir.`}
                                                rotuloDaAcao="Encerrar súmula"
                                                destrutiva={false}
                                                aoConfirmar={encerrar}
                                            />
                                        </div>

                                        <Confirmacao
                                            gatilho={
                                                <Button variant="ghost" size="sm" className="w-full text-destructive">
                                                    <Trash2 />
                                                    Excluir súmula
                                                </Button>
                                            }
                                            titulo="Excluir a súmula?"
                                            descricao="As ocorrências registradas vão junto. A partida continua, e dá para abrir outra súmula depois."
                                            rotuloDaAcao="Excluir súmula"
                                            aoConfirmar={excluir}
                                        />
                                    </div>
                                </Secao>
                            </>
                        )}

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-12 w-full"
                            nativeButton={false}
                            render={
                                <Link
                                    href={`/competicao/${idCompeticao}/partida/${idPartida}`}
                                />
                            }
                        >
                            Voltar à partida
                        </Button>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default SumulaPage;
