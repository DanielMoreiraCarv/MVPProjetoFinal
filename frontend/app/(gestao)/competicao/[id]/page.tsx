"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoCartoes, CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { CompeticaoDialog } from "@/src/features/administracoes/CompeticaoDialog";
import { CompartilharDaGestao } from "@/src/features/compartilhar/CompartilharDaGestao";
import { PessoasDaCompeticaoDialog } from "@/src/features/pessoas/PessoasDaCompeticaoDialog";
import { InscreverEquipeDialog } from "@/src/features/campeonatos/InscreverEquipeDialog";
import { ListaDeInscritas } from "@/src/features/campeonatos/ListaDeInscritas";
import { ClassificacaoPorFase } from "@/src/features/fases/ClassificacaoPorFase";
import { ListaDePartidas } from "@/src/features/partidas/ListaDePartidas";
import { GerarPartidas } from "@/src/features/estrutura/GerarPartidas";
import {
    Estrutura,
    buscarCompeticao,
    buscarEstrutura,
    mudarEstadoDaCompeticao,
    removerCompeticao,
    removerEquipeDaCompeticao,
} from "@/src/lib/api/competicoes";
import { listarPartidasDaCompeticao } from "@/src/lib/api/partidas";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";
import { formatarDiaEHora, porDataHora } from "@/src/lib/formato";
import { Competicao, EstadoDaCompeticao, ROTULO_DO_ESTADO } from "@/src/lib/types/competicao";
import { Equipe } from "@/src/lib/types/equipe";
import { Partida } from "@/src/lib/types/partida";

const VARIANTE_DO_ESTADO: Record<EstadoDaCompeticao, "default" | "secondary" | "destructive"> = {
    RASCUNHO: "secondary",
    EM_ANDAMENTO: "default",
    ENCERRADA: "secondary",
    CANCELADA: "destructive",
};

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const CompeticaoDetalhePage = () => {
    const params = useParams<{ id: string }>();
    const id = Number(params?.id);
    const router = useRouter();
    const { atual, recarregar } = useEscopo();
    const avisos = useAvisos();

    const [competicao, setCompeticao] = useState<Competicao | null>(null);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);
    const [estrutura, setEstrutura] = useState<Estrutura | null>(null);
    const [versao, setVersao] = useState(0);

    const carregar = () => {
        if (!Number.isFinite(id)) return;
        setCarregando(true);
        setErro(null);
        Promise.all([buscarCompeticao(id), listarPartidasDaCompeticao(id), buscarEstrutura(id)])
            .then(([encontrada, suasPartidas, validada]) => {
                setEstrutura(validada);
                setCompeticao(encontrada);
                setEquipes(encontrada.equipes);
                setPartidas(suasPartidas);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, [id]);

    const proximas = useMemo(
        () => partidas.filter((partida) => !partida.realizada).sort(porDataHora),
        [partidas],
    );


    const aoSalvar = (salva: Competicao) => {
        setCompeticao(salva);
        setEquipes(salva.equipes);
        recarregar();
        avisos.sucesso("Competição atualizada.");
    };

    const mudarEstado = async (destino: EstadoDaCompeticao) => {
        try {
            setCompeticao(await mudarEstadoDaCompeticao(id, destino));
            recarregar();
            avisos.sucesso(`Competição ${ROTULO_DO_ESTADO[destino].toLowerCase()}.`);
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const excluir = async () => {
        try {
            await removerCompeticao(id);
            recarregar();
            avisos.sucesso(`${competicao?.nome ?? "Competição"} excluída.`);
            router.push("/competicao");
        } catch (causa) {
            avisos.erro(causa, "Não foi possível excluir");
        }
    };

    const estado = competicao?.estado;
    const aberta = estado === "RASCUNHO" || estado === "EM_ANDAMENTO";

    return (
        <>
            <CabecalhoDaPagina
                conceito="competicao"
                titulo={competicao?.nome ?? atual?.nome ?? "Competição"}
                descricao={
                    competicao
                        ? [competicao.modalidade, competicao.categoria].filter(Boolean).join(" · ")
                        : undefined
                }
                migalhas={[
                    { rotulo: "Competições", href: "/competicao" },
                    ...(atual ? [{ rotulo: atual.nomeDaAdministracao }] : []),
                ]}
                acoes={
                    competicao && (
                        <>
                            {estado && (
                                <Badge variant={VARIANTE_DO_ESTADO[estado]}>
                                    {ROTULO_DO_ESTADO[estado]}
                                </Badge>
                            )}
                            <PessoasDaCompeticaoDialog idCompeticao={id} nomeDaCompeticao={competicao.nome} />
                            <CompartilharDaGestao />
                            <CompeticaoDialog
                                competicao={competicao}
                                aoSalvar={aoSalvar}
                                gatilho={
                                    <Button variant="outline" size="sm">
                                        <Pencil />
                                        Editar
                                    </Button>
                                }
                            />
                            <Confirmacao
                                gatilho={
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="Excluir competição"
                                        title="Excluir competição"
                                    >
                                        <Trash2 />
                                    </Button>
                                }
                                titulo={`Excluir ${competicao.nome}?`}
                                descricao={
                                    partidas.length > 0
                                        ? `Ela tem ${plural(partidas.length, "partida", "partidas")}, e o servidor só exclui competição sem histórico. Para tirá-la de circulação, cancele-a.`
                                        : "As equipes continuam cadastradas; só a competição sai. Não dá para desfazer."
                                }
                                rotuloDaAcao="Excluir competição"
                                aoConfirmar={excluir}
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
                        <div className="min-w-0 space-y-6 lg:col-span-2">
                            {carregando ? (
                                <CarregandoCartoes cartoes={3} />
                            ) : (
                                <div className="space-y-6">
                                {/* Estrutura montada e nenhuma partida: o botão
                                    único está aqui também, para não obrigar a
                                    voltar à Estrutura só para gerar. */}
                                {estrutura &&
                                    estrutura.fases.length > 0 &&
                                    !estrutura.partidasGeradas &&
                                    competicao?.estado === "RASCUNHO" && (
                                        <GerarPartidas
                                            idCompeticao={id}
                                            estrutura={estrutura}
                                            mostrarLinkDaEstrutura
                                            aoGerar={() => {
                                                recarregar();
                                                carregar();
                                                setVersao((atual) => atual + 1);
                                            }}
                                        />
                                    )}
                                <Tabs defaultValue="classificacao">
                                    <TabsList>
                                        <TabsTrigger value="classificacao">Classificação</TabsTrigger>
                                        <TabsTrigger value="calendario">Calendário</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="classificacao" className="pt-4">
                                        <ClassificacaoPorFase key={versao} idCompeticao={id} />
                                    </TabsContent>

                                    <TabsContent value="calendario" className="pt-4">
                                        {partidas.length === 0 ? (
                                            <Vazio
                                                conceito="calendario"
                                                titulo="Calendário vazio"
                                                descricao="Nenhuma partida gerada nesta competição."
                                            />
                                        ) : (
                                            <ListaDePartidas partidas={partidas} idCompeticao={id} />
                                        )}
                                    </TabsContent>
                                </Tabs>
                                </div>
                            )}

                            {aberta && (
                                <Secao
                                    titulo="Situação"
                                    descricao={
                                        estado === "RASCUNHO"
                                            ? estrutura && estrutura.fases.length > 0
                                                ? "Em rascunho: as partidas ainda não foram geradas. Gerar, no quadro acima, é o que coloca a competição em andamento."
                                                : "Em rascunho: monte as fases na Estrutura; depois, gere as partidas."
                                            : "Encerrar fecha a competição com o resultado atual. Cancelar a tira de circulação sem resultado."
                                    }
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {estado === "RASCUNHO" ? (
                                            estrutura && estrutura.fases.length > 0 ? null : (
                                            <Button
                                                size="sm"
                                                nativeButton={false}
                                                render={<Link href={`/competicao/${id}/estrutura`} />}
                                            >
                                                Ir para a Estrutura
                                            </Button>
                                            )
                                        ) : (
                                            <Confirmacao
                                                gatilho={<Button size="sm">Encerrar competição</Button>}
                                                titulo="Encerrar a competição?"
                                                descricao={
                                                    proximas.length > 0
                                                        ? `Ainda há ${plural(proximas.length, "partida aberta", "partidas abertas")}. Encerrada, a competição não volta a andamento.`
                                                        : "Encerrada, a competição não volta a andamento."
                                                }
                                                rotuloDaAcao="Encerrar competição"
                                                destrutiva={false}
                                                aoConfirmar={() => mudarEstado("ENCERRADA")}
                                            />
                                        )}
                                        <Confirmacao
                                            gatilho={
                                                <Button variant="outline" size="sm">
                                                    Cancelar competição
                                                </Button>
                                            }
                                            titulo="Cancelar a competição?"
                                            descricao="Cancelar é definitivo. As partidas continuam no histórico, mas a competição não volta a andamento."
                                            rotuloDaAcao="Cancelar competição"
                                            aoConfirmar={() => mudarEstado("CANCELADA")}
                                        />
                                    </div>
                                </Secao>
                            )}
                        </div>

                        <div className="min-w-0 space-y-6">
                            {/* Os próximos jogos vivem aqui, e não numa lista
                                geral: fora da competição eles não diziam de
                                qual competição eram. */}
                            <Secao titulo="Próximos jogos">
                                {carregando ? (
                                    <CarregandoLista linhas={3} />
                                ) : proximas.length === 0 ? (
                                    <Vazio
                                        conceito="partida"
                                        titulo="Nenhum jogo agendado"
                                        descricao="As partidas aparecem quando uma fase gera os confrontos."
                                    />
                                ) : (
                                    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border">
                                        {proximas.slice(0, 5).map((partida) => (
                                            <li key={partida.id}>
                                                <Link
                                                    href={`/competicao/${id}/partida/${partida.id}`}
                                                    className="block px-4 py-2.5 transition-colors hover:bg-muted/50"
                                                >
                                                    <span className="block truncate text-sm font-medium">
                                                        {partida.equipeMandante} × {partida.equipeVisitante}
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        {partida.dataHora
                                                            ? formatarDiaEHora(partida.dataHora)
                                                            : "Sem data"}
                                                        {partida.local ? ` · ${partida.local}` : ""}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Secao>

                            <Secao
                                titulo={`Equipes inscritas${equipes.length ? ` (${equipes.length})` : ""}`}
                                acao={
                                    aberta && (
                                        <InscreverEquipeDialog
                                            idCompeticao={id}
                                            jaInscritas={equipes}
                                            aoInscrever={(atualizada) => setEquipes(atualizada.equipes)}
                                        />
                                    )
                                }
                            >
                                {carregando ? (
                                    <CarregandoLista linhas={4} />
                                ) : equipes.length === 0 ? (
                                    <Vazio
                                        conceito="equipe"
                                        titulo="Nenhuma equipe inscrita"
                                        descricao="Inscreva as equipes que vão disputar."
                                    />
                                ) : (
                                    <ListaDeInscritas
                                        equipes={equipes}
                                        aoRemover={
                                            aberta
                                                ? async (equipe) => {
                                                      try {
                                                          const atualizada =
                                                              await removerEquipeDaCompeticao(id, equipe.id);
                                                          setEquipes(atualizada.equipes);
                                                          avisos.sucesso(`${equipe.nome} saiu da competição.`);
                                                      } catch (causa) {
                                                          avisos.erro(causa);
                                                      }
                                                  }
                                                : undefined
                                        }
                                    />
                                )}
                            </Secao>
                        </div>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default CompeticaoDetalhePage;
