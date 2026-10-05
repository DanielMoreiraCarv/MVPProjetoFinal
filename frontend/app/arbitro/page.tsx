"use client";

import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { ArbitroDialog } from "@/src/features/cadastros/ArbitroDialog";
import { Arbitro, listarArbitros, removerArbitro } from "@/src/lib/api/arbitros";
import { useAvisos } from "@/src/lib/avisos";
import { normalizar } from "@/src/lib/escopo";
import { ICONES } from "@/src/lib/icones";

const ArbitroPage = () => {
    const avisos = useAvisos();
    const IconeArbitro = ICONES.arbitro;

    const [arbitros, setArbitros] = useState<Arbitro[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);
    const [busca, setBusca] = useState("");

    const carregar = () => {
        setCarregando(true);
        setErro(null);
        listarArbitros()
            .then(setArbitros)
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, []);

    const resultados = useMemo(() => {
        const termo = normalizar(busca);
        return arbitros
            .filter((arbitro) => !termo || normalizar(arbitro.nome).includes(termo))
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }, [arbitros, busca]);

    const excluir = async (arbitro: Arbitro) => {
        try {
            await removerArbitro(arbitro.id);
            setArbitros((atuais) => atuais.filter((outro) => outro.id !== arbitro.id));
            avisos.sucesso(`${arbitro.nome} foi excluído.`);
        } catch (causa) {
            // Árbitro escalado em partida é recusado com `CONFLITO`; a razão
            // vem do servidor e é a única coisa que explica a recusa.
            avisos.erro(causa);
        }
    };

    return (
        <>
            <CabecalhoDaPagina
                conceito="arbitro"
                titulo="Árbitros"
                descricao="Quem pode ser escalado para apitar as partidas."
                acoes={
                    <ArbitroDialog
                        aoSalvar={(criado) => {
                            setArbitros((atuais) => [...atuais, criado]);
                            avisos.sucesso(`${criado.nome} cadastrado.`);
                        }}
                    />
                }
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : (
                    <Secao
                        titulo={
                            arbitros.length === 1
                                ? "1 árbitro"
                                : `${arbitros.length} árbitros`
                        }
                        acao={
                            <div className="flex w-full max-w-xs items-center gap-2 rounded-3xl border border-border px-4">
                                <Search className="size-4 shrink-0 text-muted-foreground" />
                                <input
                                    value={busca}
                                    onChange={(evento) => setBusca(evento.target.value)}
                                    placeholder="Buscar pelo nome…"
                                    aria-label="Buscar árbitro"
                                    className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        }
                    >
                        {carregando ? (
                            <CarregandoLista linhas={5} />
                        ) : arbitros.length === 0 ? (
                            <Vazio
                                conceito="arbitro"
                                titulo="Nenhum árbitro cadastrado"
                                descricao="Cadastre quem vai apitar antes de escalar alguém numa partida."
                            />
                        ) : resultados.length === 0 ? (
                            <Vazio
                                conceito="arbitro"
                                titulo="Nenhum árbitro com esse nome"
                                descricao={`Nada encontrado para "${busca}".`}
                            />
                        ) : (
                            <div className="space-y-2">
                                {resultados.map((arbitro) => (
                                    <Card
                                        key={arbitro.id}
                                        className="transition-colors hover:border-ring"
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <IconeArbitro className="size-4 shrink-0 text-muted-foreground" />
                                                    <span className="min-w-0 truncate">
                                                        {arbitro.nome}
                                                    </span>
                                                </span>
                                                <span className="flex shrink-0 items-center gap-1">
                                                    <Badge variant="secondary">
                                                        {arbitro.partidasApitadas === 1
                                                            ? "1 partida apitada"
                                                            : `${arbitro.partidasApitadas} partidas apitadas`}
                                                    </Badge>
                                                    <ArbitroDialog
                                                        arbitro={arbitro}
                                                        aoSalvar={(salvo) => {
                                                            setArbitros((atuais) =>
                                                                atuais.map((outro) =>
                                                                    outro.id === salvo.id
                                                                        ? salvo
                                                                        : outro,
                                                                ),
                                                            );
                                                            avisos.sucesso(
                                                                `${salvo.nome} atualizado.`,
                                                            );
                                                        }}
                                                    />
                                                    <Confirmacao
                                                        gatilho={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-xs"
                                                                aria-label={`Excluir ${arbitro.nome}`}
                                                                title="Excluir árbitro"
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        }
                                                        titulo={`Excluir ${arbitro.nome}?`}
                                                        descricao="As partidas que ele apitou continuam registradas. Se ele estiver escalado em alguma partida, a exclusão é recusada."
                                                        rotuloDaAcao="Excluir árbitro"
                                                        aoConfirmar={() => excluir(arbitro)}
                                                    />
                                                </span>
                                            </CardTitle>
                                            <CardDescription>
                                                {[arbitro.federacao ?? "Sem federação",
                                                  arbitro.categoria]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}

                    </Secao>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default ArbitroPage;
