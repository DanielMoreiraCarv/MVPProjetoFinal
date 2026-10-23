"use client";

import { Clock, UserMinus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro } from "@/src/components/estado/Estados";
import { Monograma } from "@/src/components/Monograma";
import {
    PessoasDaCompeticao,
    cancelarConvite,
    convidarPessoa,
    listarPessoas,
    removerPessoa,
} from "@/src/lib/api/pessoas";
import { useAvisos } from "@/src/lib/avisos";
import { useEscopo } from "@/src/lib/escopo";

/**
 * Com quem a competição é compartilhada. Quem participa pode tudo nela —
 * não há níveis —, então convidar é entregar a chave: o texto diz isso antes
 * do botão.
 */
export const PessoasDaCompeticaoDialog = ({
    idCompeticao,
    nomeDaCompeticao,
}: {
    idCompeticao: number;
    nomeDaCompeticao: string;
}) => {
    const [aberto, setAberto] = useState(false);
    const [pessoas, setPessoas] = useState<PessoasDaCompeticao | null>(null);
    const [erro, setErro] = useState<unknown>(null);
    const [email, setEmail] = useState("");
    const [enviando, setEnviando] = useState(false);
    const avisos = useAvisos();
    const router = useRouter();
    const { recarregar } = useEscopo();

    const carregar = useCallback(() => {
        setErro(null);
        listarPessoas(idCompeticao).then(setPessoas).catch(setErro);
    }, [idCompeticao]);

    const abrirOuFechar = (abrir: boolean) => {
        setAberto(abrir);
        if (abrir) carregar();
    };

    const convidar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        const destino = email.trim();
        if (!destino) return;
        setEnviando(true);
        try {
            const atualizadas = await convidarPessoa(idCompeticao, destino);
            const entrou = atualizadas.participantes.some(
                (pessoa) => pessoa.email.toLowerCase() === destino.toLowerCase(),
            );
            setPessoas(atualizadas);
            setEmail("");
            avisos.sucesso(
                entrou ? "Pessoa adicionada." : "Convite guardado.",
                entrou
                    ? `${destino} já pode abrir ${nomeDaCompeticao}.`
                    : `Quando ${destino} criar a conta com esse e-mail, a competição aparece para ela.`,
            );
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setEnviando(false);
        }
    };

    const remover = async (idUsuario: number, voce: boolean) => {
        try {
            const atualizadas = await removerPessoa(idCompeticao, idUsuario);
            if (voce) {
                avisos.sucesso("Você saiu da competição.");
                recarregar();
                router.push("/competicao");
                return;
            }
            setPessoas(atualizadas);
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const desistir = async (idConvite: number) => {
        try {
            setPessoas(await cancelarConvite(idCompeticao, idConvite));
        } catch (causa) {
            avisos.erro(causa);
        }
    };

    const sozinho = (pessoas?.participantes.length ?? 0) <= 1;

    return (
        <Dialog open={aberto} onOpenChange={abrirOuFechar}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
                <Users />
                Pessoas
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Pessoas da competição</DialogTitle>
                    <DialogDescription>
                        Quem participa pode tudo em {nomeDaCompeticao}: editar, gerar partidas,
                        preencher súmulas e convidar outras pessoas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={convidar} className="flex gap-2">
                    <Input
                        type="email"
                        value={email}
                        onChange={(evento) => setEmail(evento.target.value)}
                        placeholder="email@da.pessoa"
                        aria-label="E-mail de quem convidar"
                        required
                        className="min-w-0 flex-1"
                    />
                    <Button type="submit" disabled={enviando || !email.trim()} className="shrink-0">
                        {enviando ? "Convidando…" : "Convidar"}
                    </Button>
                </form>

                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : !pessoas ? (
                    <CarregandoLista linhas={2} />
                ) : (
                    <div className="max-h-[50vh] space-y-4 overflow-y-auto">
                        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                            {pessoas.participantes.map((pessoa) => (
                                <li key={pessoa.id} className="flex items-center gap-3 px-3 py-2.5">
                                    <Monograma nome={pessoa.nome} className="size-8" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {pessoa.nome}
                                            {pessoa.voce && (
                                                <span className="font-normal text-muted-foreground"> (você)</span>
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">{pessoa.email}</p>
                                    </div>
                                    {!sozinho && (
                                        <Confirmacao
                                            gatilho={
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={pessoa.voce ? "Sair da competição" : `Remover ${pessoa.nome}`}
                                                    title={pessoa.voce ? "Sair da competição" : "Remover da competição"}
                                                >
                                                    <UserMinus />
                                                </Button>
                                            }
                                            titulo={pessoa.voce ? "Sair da competição?" : `Remover ${pessoa.nome}?`}
                                            descricao={
                                                pessoa.voce
                                                    ? `Você deixa de ver ${nomeDaCompeticao}. Para voltar, alguém que participa precisa convidar você de novo.`
                                                    : `${pessoa.nome} deixa de ver ${nomeDaCompeticao}. Dá para convidar de novo depois.`
                                            }
                                            rotuloDaAcao={pessoa.voce ? "Sair da competição" : "Remover"}
                                            aoConfirmar={() => remover(pessoa.id, pessoa.voce)}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>

                        {pessoas.convites.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Aguardando cadastro
                                </p>
                                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-dashed border-border">
                                    {pessoas.convites.map((convite) => (
                                        <li key={convite.id} className="flex items-center gap-3 px-3 py-2.5">
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                                <Clock className="size-4" />
                                            </span>
                                            <p className="min-w-0 flex-1 truncate text-sm">{convite.email}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Cancelar o convite de ${convite.email}`}
                                                title="Cancelar convite"
                                                onClick={() => desistir(convite.id)}
                                            >
                                                <X />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-muted-foreground">
                                    Não enviamos e-mail: avise a pessoa para criar a conta com esse endereço.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
