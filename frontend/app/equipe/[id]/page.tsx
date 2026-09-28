"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { AtletaDialog } from "@/src/features/equipes/AtletaDialog";
import { ElencoList } from "@/src/features/equipes/ElencoList";
import { EquipeDialog } from "@/src/features/equipes/EquipeDialog";
import { TrazerAtletaDialog } from "@/src/features/equipes/TrazerAtletaDialog";
import { removerAtleta } from "@/src/lib/api/atletas";
import {
    buscarEquipe,
    listarElenco,
    removerDoElenco,
    removerEquipe,
} from "@/src/lib/api/equipes";
import { listarPartidasDaEquipe } from "@/src/lib/api/partidas";
import { useAvisos } from "@/src/lib/avisos";
import { formatarDiaEHora, porDataHora } from "@/src/lib/formato";
import { ICONES } from "@/src/lib/icones";
import { Atleta } from "@/src/lib/types/atleta";
import { Equipe } from "@/src/lib/types/equipe";
import { Partida } from "@/src/lib/types/partida";

/**
 * A equipe e o elenco dela.
 *
 * As duas maneiras de crescer o elenco ficam lado a lado com nomes diferentes
 * porque são coisas diferentes: "Cadastrar atleta" cria uma pessoa no
 * cadastro, "Trazer atleta" move para cá alguém que já existe.
 */

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
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {titulo}
            </h2>
            {acao}
        </div>
        {children}
    </section>
);

const EquipeDetalhePage = () => {
    const params = useParams<{ id: string }>();
    const id = Number(params?.id);
    const router = useRouter();
    const avisos = useAvisos();

    const [equipe, setEquipe] = useState<Equipe | null>(null);
    const [elenco, setElenco] = useState<Atleta[]>([]);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = useCallback(() => {
        if (!Number.isFinite(id)) return;
        setCarregando(true);
        setErro(null);
        Promise.all([buscarEquipe(id), listarElenco(id), listarPartidasDaEquipe(id)])
            .then(([encontrada, seuElenco, suasPartidas]) => {
                setEquipe(encontrada);
                setElenco(seuElenco);
                setPartidas(suasPartidas);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [id]);

    useEffect(carregar, [carregar]);

    const ordenadas = useMemo(() => [...partidas].sort(porDataHora), [partidas]);

    const IconePartida = ICONES.partida;
    const idModalidade = equipe?.modalidade.id || undefined;

    const excluirEquipe = async () => {
        try {
            await removerEquipe(id);
            avisos.sucesso(`${equipe?.nome ?? "A equipe"} foi excluída.`);
            router.push("/equipe");
        } catch (causa) {
            // A recusa por vínculo — equipe inscrita numa competição — chega
            // com a razão do servidor.
            avisos.erro(causa);
        }
    };

    const tirarDoElenco = async (atleta: Atleta) => {
        try {
            const atualizada = await removerDoElenco(id, atleta.id);
            setEquipe(atualizada);
            setElenco(atualizada.atletas);
            avisos.sucesso(`${atleta.nome} saiu do elenco.`, "O cadastro dele continua.");
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const excluirAtleta = async (atleta: Atleta) => {
        try {
            await removerAtleta(atleta.id);
            setElenco((atuais) => atuais.filter((a) => a.id !== atleta.id));
            avisos.sucesso(`O cadastro de ${atleta.nome} foi excluído.`);
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    return (
        <>
            <CabecalhoDaPagina
                conceito="equipe"
                titulo={equipe?.nome ?? "Equipe"}
                descricao={
                    equipe
                        ? [
                              equipe.modalidade.nome || "Sem modalidade",
                              equipe.federacao?.nome ?? "Sem federação",
                          ].join(" · ")
                        : undefined
                }
                migalhas={[
                    { rotulo: "Equipes", href: "/equipe" },
                    ...(equipe ? [{ rotulo: equipe.nome }] : []),
                ]}
                acoes={
                    equipe && (
                        <>
                            <EquipeDialog
                                equipe={equipe}
                                aoSalvar={(atualizada) => setEquipe(atualizada)}
                                gatilho={
                                    <Button size="sm" variant="outline">
                                        Editar equipe
                                    </Button>
                                }
                            />
                            <Confirmacao
                                gatilho={
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label={`Excluir ${equipe.nome}`}
                                        title="Excluir equipe"
                                    >
                                        <Trash2 />
                                    </Button>
                                }
                                titulo={`Excluir ${equipe.nome}?`}
                                descricao="O elenco não é apagado: os atletas continuam cadastrados, sem equipe. A exclusão é recusada enquanto a equipe estiver inscrita numa competição."
                                rotuloDaAcao="Excluir equipe"
                                aoConfirmar={excluirEquipe}
                            />
                        </>
                    )
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Secao
                            className="lg:col-span-2"
                            titulo={
                                carregando
                                    ? "Elenco"
                                    : elenco.length === 1
                                      ? "Elenco · 1 atleta"
                                      : `Elenco · ${elenco.length} atletas`
                            }
                            acao={
                                equipe && (
                                    <div className="flex items-center gap-2">
                                        <TrazerAtletaDialog
                                            idEquipe={id}
                                            aoTrazer={(atualizada) => {
                                                setEquipe(atualizada);
                                                setElenco(atualizada.atletas);
                                            }}
                                        />
                                        <AtletaDialog
                                            idEquipe={id}
                                            idModalidadeDaEquipe={idModalidade}
                                            aoSalvar={(novo) =>
                                                setElenco((atuais) => [...atuais, novo])
                                            }
                                        />
                                    </div>
                                )
                            }
                        >
                            {carregando ? (
                                <CarregandoLista linhas={5} />
                            ) : elenco.length === 0 ? (
                                <Vazio
                                    conceito="elenco"
                                    titulo="Elenco vazio"
                                    descricao="Cadastre um atleta novo, ou traga para cá alguém que já está no cadastro."
                                />
                            ) : (
                                <ElencoList
                                    atletas={elenco}
                                    idEquipe={id}
                                    idModalidadeDaEquipe={idModalidade}
                                    nomeDaEquipe={equipe?.nome ?? "esta equipe"}
                                    aoSalvarAtleta={(salvo) =>
                                        setElenco((atuais) =>
                                            atuais.map((a) => (a.id === salvo.id ? salvo : a)),
                                        )
                                    }
                                    aoRemoverDoElenco={tirarDoElenco}
                                    aoExcluirAtleta={excluirAtleta}
                                />
                            )}
                        </Secao>

                        <Secao titulo="Partidas da equipe">
                            {carregando ? (
                                <CarregandoLista linhas={4} />
                            ) : ordenadas.length === 0 ? (
                                <Vazio
                                    conceito="partida"
                                    titulo="Nenhuma partida"
                                    descricao="As partidas aparecem quando a equipe é inscrita numa competição e a fase gera os confrontos."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {ordenadas.map((partida) => (
                                        // A partida mora dentro da competição
                                        // dela: fora de uma, não há rota para
                                        // abrir.
                                        <Link
                                            key={partida.id}
                                            href={`/competicao/${partida.idCompeticao}/partida/${partida.id}`}
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
                                                        {partida.realizada && (
                                                            <span className="ml-auto shrink-0 font-mono text-sm">
                                                                {partida.placarMandante ?? 0}–
                                                                {partida.placarVisitante ?? 0}
                                                            </span>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {partida.nomeCompeticao}
                                                    </CardDescription>
                                                    <CardDescription>
                                                        {partida.realizada
                                                            ? `Realizada · ${formatarDiaEHora(partida.dataHora, "sem data")}`
                                                            : formatarDiaEHora(partida.dataHora)}
                                                        {partida.local ? ` · ${partida.local}` : ""}
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

export default EquipeDetalhePage;
