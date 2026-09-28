"use client";

import { Ban, Pencil, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { ApiError } from "@/src/lib/api/client";
import {
    Sancao,
    SancaoDeAtleta,
    aplicarSancaoAAtleta,
    atualizarSancao,
    criarSancao,
    inativarSancaoDeAtleta,
    listarSancoes,
    listarSancoesDeAtleta,
    removerSancao,
} from "@/src/lib/api/sancoes";
import { listarElenco } from "@/src/lib/api/equipes";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";

const Secao = ({
    titulo,
    descricao,
    acao,
    className,
    children,
}: {
    titulo: string;
    descricao?: string;
    acao?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section className={cn("space-y-3", className)}>
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

/** O formulário da regra de sanção. */
const DialogoDeRegra = ({
    idCompeticao,
    sancao,
    aoSalvar,
}: {
    idCompeticao: number;
    sancao?: Sancao;
    aoSalvar: () => void;
}) => {
    const editando = Boolean(sancao);
    const [aberto, setAberto] = useState(false);
    const [partidas, setPartidas] = useState(String(sancao?.partidasPadrao ?? 1));
    const [tipoEsporte, setTipoEsporte] = useState(sancao?.tipoEsporte ?? "");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<ApiError | null>(null);
    const avisos = useAvisos();

    const abrir = (estado: boolean) => {
        setAberto(estado);
        if (estado) {
            setPartidas(String(sancao?.partidasPadrao ?? 1));
            setTipoEsporte(sancao?.tipoEsporte ?? "");
            setErro(null);
        }
    };

    const salvar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        setErro(null);

        const entrada = {
            qtdPartidas: Number(partidas),
            tipoEsporte: tipoEsporte.trim(),
            idCompeticao,
        };

        try {
            if (sancao) await atualizarSancao(sancao.id, entrada);
            else await criarSancao(entrada);

            avisos.sucesso(editando ? "Regra atualizada." : "Regra criada.");
            aoSalvar();
            setAberto(false);
        } catch (causa) {
            // O contrato de erro diz qual campo falhou; mostrar no campo é
            // melhor do que uma faixa no topo que a pessoa tem que traduzir.
            if (causa instanceof ApiError) setErro(causa);
            else avisos.erro(causa);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={abrir}>
            <DialogTrigger
                render={<Button size={editando ? "icon-xs" : "sm"} variant={editando ? "ghost" : "default"} />}
                aria-label={editando ? "Editar regra" : undefined}
            >
                {editando ? <Pencil /> : <><Plus />Nova regra</>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={salvar} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{editando ? "Editar regra" : "Nova regra de sanção"}</DialogTitle>
                        <DialogDescription>
                            Quantas partidas de suspensão uma infração custa nesta competição.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1.5">
                        <Label htmlFor="tipo">Infração</Label>
                        <Input
                            id="tipo"
                            value={tipoEsporte}
                            onChange={(e) => setTipoEsporte(e.target.value)}
                            placeholder="Cartão vermelho"
                            aria-invalid={Boolean(erro?.mensagemDoCampo("tipoEsporte"))}
                        />
                        {erro?.mensagemDoCampo("tipoEsporte") && (
                            <p role="alert" className="text-xs text-destructive">
                                {erro.mensagemDoCampo("tipoEsporte")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="partidas">Partidas de suspensão</Label>
                        <Input
                            id="partidas"
                            type="number"
                            min={0}
                            value={partidas}
                            onChange={(e) => setPartidas(e.target.value)}
                            aria-invalid={Boolean(erro?.mensagemDoCampo("qtdPartidas"))}
                        />
                        {erro?.mensagemDoCampo("qtdPartidas") && (
                            <p role="alert" className="text-xs text-destructive">
                                {erro.mensagemDoCampo("qtdPartidas")}
                            </p>
                        )}
                    </div>

                    {erro && !erro.ehValidacao && (
                        <p role="alert" className="text-sm text-destructive">
                            {erro.message}
                        </p>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={salvando}>
                            {salvando ? "Salvando…" : "Salvar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

/** Lança a suspensão de um atleta a partir de uma regra. */
const DialogoDeSuspensao = ({
    regras,
    equipes,
    aoSalvar,
}: {
    regras: Sancao[];
    equipes: { id: number; nome: string }[];
    aoSalvar: () => void;
}) => {
    const [aberto, setAberto] = useState(false);
    const [idSancao, setIdSancao] = useState("");
    const [idEquipe, setIdEquipe] = useState("");
    const [elenco, setElenco] = useState<{ id: number; nome: string }[]>([]);
    const [idAtleta, setIdAtleta] = useState("");
    const [justificativa, setJustificativa] = useState("");
    const [salvando, setSalvando] = useState(false);
    const avisos = useAvisos();

    // O atleta é escolhido dentro de uma equipe: uma lista com todos os
    // atletas da competição teria centenas de nomes sem contexto.
    useEffect(() => {
        if (!idEquipe) {
            setElenco([]);
            return;
        }
        listarElenco(Number(idEquipe))
            .then((atletas) => setElenco(atletas.map((a) => ({ id: a.id, nome: a.nome }))))
            .catch(() => setElenco([]));
        setIdAtleta("");
    }, [idEquipe]);

    const salvar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        try {
            await aplicarSancaoAAtleta({
                idSancao: Number(idSancao),
                idAtleta: Number(idAtleta),
                justificativa: justificativa.trim() || undefined,
            });
            avisos.sucesso("Suspensão lançada.");
            aoSalvar();
            setAberto(false);
            setIdAtleta("");
            setJustificativa("");
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setSalvando(false);
        }
    };

    const podeSalvar = idSancao && idAtleta && !salvando;

    return (
        <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger render={<Button size="sm" disabled={regras.length === 0} />}>
                <Plus />
                Lançar suspensão
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={salvar} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Lançar suspensão</DialogTitle>
                        <DialogDescription>
                            A partir de uma regra desta competição. A suspensão é lançada à mão
                            porque derivá-la da contagem de cartões depende da entidade Evento,
                            que ainda não existe.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1.5">
                        <Label htmlFor="regra">Regra</Label>
                        <select
                            id="regra"
                            value={idSancao}
                            onChange={(e) => setIdSancao(e.target.value)}
                            className="h-9 w-full rounded-3xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                        >
                            <option value="">Escolha…</option>
                            {regras.map((regra) => (
                                <option key={regra.id} value={regra.id}>
                                    {regra.tipoEsporte} — {regra.partidasPadrao} partida(s)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="equipe">Equipe</Label>
                            <select
                                id="equipe"
                                value={idEquipe}
                                onChange={(e) => setIdEquipe(e.target.value)}
                                className="h-9 w-full rounded-3xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                            >
                                <option value="">Escolha…</option>
                                {equipes.map((equipe) => (
                                    <option key={equipe.id} value={equipe.id}>
                                        {equipe.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="atleta">Atleta</Label>
                            <select
                                id="atleta"
                                value={idAtleta}
                                onChange={(e) => setIdAtleta(e.target.value)}
                                disabled={elenco.length === 0}
                                className="h-9 w-full rounded-3xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
                            >
                                <option value="">
                                    {idEquipe ? "Escolha…" : "Escolha a equipe"}
                                </option>
                                {elenco.map((atleta) => (
                                    <option key={atleta.id} value={atleta.id}>
                                        {atleta.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="justificativa">Justificativa</Label>
                        <Textarea
                            id="justificativa"
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            placeholder="Expulso aos 38 do segundo tempo."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={!podeSalvar}>
                            {salvando ? "Lançando…" : "Lançar suspensão"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const SancaoPage = () => {
    const params = useParams<{ id: string }>();
    const idCompeticao = Number(params?.id);
    const { atual } = useEscopo();
    const avisos = useAvisos();

    const [regras, setRegras] = useState<Sancao[]>([]);
    const [aplicadas, setAplicadas] = useState<SancaoDeAtleta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = () => {
        setCarregando(true);
        setErro(null);
        Promise.all([listarSancoes(), listarSancoesDeAtleta()])
            .then(([todasRegras, todasAplicadas]) => {
                setRegras(todasRegras);
                setAplicadas(todasAplicadas);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, []);

    // A rota de sanção não filtra por competição, então o recorte é aqui.
    const daCompeticao = useMemo(
        () => regras.filter((regra) => regra.idCompeticao === idCompeticao),
        [regras, idCompeticao],
    );

    const cumprindo = useMemo(
        () => aplicadas.filter((a) => a.partidasRestantes > 0),
        [aplicadas],
    );

    return (
        <>
            <CabecalhoDaPagina
                conceito="sancao"
                titulo="Sanções"
                descricao={atual ? `Regras e suspensões de ${atual.nome}` : undefined}
                migalhas={[
                    { rotulo: "Competições", href: "/competicao" },
                    ...(atual ? [{ rotulo: atual.nome, href: `/competicao/${idCompeticao}` }] : []),
                    { rotulo: "Sanções" },
                ]}
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Secao
                            titulo="Regras"
                            descricao="Quanto cada infração custa de suspensão."
                            acao={
                                <DialogoDeRegra idCompeticao={idCompeticao} aoSalvar={carregar} />
                            }
                        >
                            {carregando ? (
                                <CarregandoLista linhas={3} />
                            ) : daCompeticao.length === 0 ? (
                                <Vazio
                                    conceito="sancao"
                                    titulo="Nenhuma regra definida"
                                    descricao="Defina quantas partidas cada infração custa nesta competição."
                                    acao={
                                        <DialogoDeRegra
                                            idCompeticao={idCompeticao}
                                            aoSalvar={carregar}
                                        />
                                    }
                                />
                            ) : (
                                <div className="space-y-2">
                                    {daCompeticao.map((regra) => (
                                        <Card key={regra.id}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="min-w-0 truncate">
                                                        {regra.tipoEsporte}
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-1">
                                                        <Badge variant="secondary">
                                                            {regra.partidasPadrao}{" "}
                                                            {regra.partidasPadrao === 1
                                                                ? "partida"
                                                                : "partidas"}
                                                        </Badge>
                                                        <DialogoDeRegra
                                                            idCompeticao={idCompeticao}
                                                            sancao={regra}
                                                            aoSalvar={carregar}
                                                        />
                                                        <Confirmacao
                                                            gatilho={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-xs"
                                                                    aria-label="Excluir regra"
                                                                >
                                                                    <Trash2 />
                                                                </Button>
                                                            }
                                                            titulo="Excluir a regra?"
                                                            descricao="As suspensões já aplicadas por ela continuam registradas."
                                                            rotuloDaAcao="Excluir regra"
                                                            aoConfirmar={async () => {
                                                                try {
                                                                    await removerSancao(regra.id);
                                                                    avisos.sucesso("Regra excluída.");
                                                                    carregar();
                                                                } catch (causa) {
                                                                    avisos.erro(causa);
                                                                }
                                                            }}
                                                        />
                                                    </span>
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Secao>

                        <Secao
                            titulo="Atletas suspensos"
                            descricao="Quem está cumprindo, e quantas partidas faltam."
                            acao={
                                <DialogoDeSuspensao
                                    regras={daCompeticao}
                                    equipes={atual?.equipes ?? []}
                                    aoSalvar={carregar}
                                />
                            }
                        >
                            {carregando ? (
                                <CarregandoLista linhas={3} />
                            ) : cumprindo.length === 0 ? (
                                <Vazio
                                    conceito="atleta"
                                    titulo="Nenhum atleta suspenso"
                                    descricao="A suspensão é lançada à mão. Derivá-la da contagem de cartões depende da entidade Evento, que ainda não existe — sem ela a súmula guarda ocorrência como texto livre."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {cumprindo.map((punicao) => (
                                        <Card key={punicao.id}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="min-w-0 truncate">
                                                        {punicao.nomeAtleta}
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-1">
                                                        <Badge variant="outline">
                                                            <span className="numero-tabular font-mono">
                                                                {punicao.partidasRestantes}
                                                            </span>{" "}
                                                            a cumprir
                                                        </Badge>
                                                        <Confirmacao
                                                            gatilho={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-xs"
                                                                    aria-label="Encerrar suspensão"
                                                                    title="Encerrar suspensão"
                                                                >
                                                                    <Ban />
                                                                </Button>
                                                            }
                                                            titulo="Encerrar a suspensão?"
                                                            descricao="O registro fica no histórico; o atleta volta a poder ser escalado."
                                                            rotuloDaAcao="Encerrar suspensão"
                                                            destrutiva={false}
                                                            aoConfirmar={async () => {
                                                                try {
                                                                    await inativarSancaoDeAtleta(
                                                                        punicao.id,
                                                                    );
                                                                    avisos.sucesso(
                                                                        "Suspensão encerrada.",
                                                                    );
                                                                    carregar();
                                                                } catch (causa) {
                                                                    avisos.erro(causa);
                                                                }
                                                            }}
                                                        />
                                                    </span>
                                                </CardTitle>
                                                {punicao.justificativa && (
                                                    <CardDescription>
                                                        {punicao.justificativa}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                        </Card>
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

export default SancaoPage;
