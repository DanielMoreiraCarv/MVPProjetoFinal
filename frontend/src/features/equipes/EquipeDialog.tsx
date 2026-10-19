"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ApiError } from "@/src/lib/api/client";
import { criarEquipe, atualizarEquipe, EquipeInput } from "@/src/lib/api/equipes";
import { criarFederacao, Federacao, listarFederacoes } from "@/src/lib/api/federacoes";
import { listarModalidades, Modalidade } from "@/src/lib/api/modalidades";
import { useAvisos } from "@/src/lib/avisos";
import { Equipe } from "@/src/lib/types/equipe";

const SEM_FEDERACAO = "nenhuma";

/**
 * Cadastro e edição da equipe no mesmo formulário: os campos são os mesmos, e
 * duas telas iguais divergem na primeira mudança.
 *
 * Na edição sai só o que mudou. O servidor trata campo ausente como campo que
 * não muda, então mandar o formulário inteiro reescreveria a federação e a
 * modalidade com o que estava na tela — inclusive quando a tela abriu com
 * eles vazios porque a resposta não os trouxe.
 */
export const EquipeDialog = ({
    equipe,
    aoSalvar,
    gatilho,
}: {
    equipe?: Equipe;
    aoSalvar: (equipe: Equipe) => void;
    gatilho?: React.ReactElement;
}) => {
    const editando = !!equipe;
    const avisos = useAvisos();

    const [aberto, setAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [modalidade, setModalidade] = useState<string[]>([]);
    const [federacao, setFederacao] = useState<string[]>([SEM_FEDERACAO]);
    const [modalidades, setModalidades] = useState<Modalidade[]>([]);
    const [federacoes, setFederacoes] = useState<Federacao[]>([]);
    const [novaFederacao, setNovaFederacao] = useState("");
    const [criandoFederacao, setCriandoFederacao] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<ApiError | Error | null>(null);
    const [erroDoCatalogo, setErroDoCatalogo] = useState<string | null>(null);

    useEffect(() => {
        if (!aberto) return;

        setErroDoCatalogo(null);
        Promise.all([listarModalidades(), listarFederacoes()])
            .then(([catalogo, oficiais]) => {
                setModalidades(catalogo);
                setFederacoes(oficiais);
            })
            .catch((causa) =>
                setErroDoCatalogo(
                    causa instanceof Error
                        ? causa.message
                        : "Não foi possível carregar modalidades e federações.",
                ),
            );
    }, [aberto]);

    const aoAbrir = (abrindo: boolean) => {
        setAberto(abrindo);
        if (!abrindo) return;

        setNome(equipe?.nome ?? "");
        setModalidade(equipe?.modalidade.id ? [String(equipe.modalidade.id)] : []);
        setFederacao([equipe?.federacao ? String(equipe.federacao.id) : SEM_FEDERACAO]);
        setNovaFederacao("");
        setErro(null);
    };

    const mensagemDoCampo = (campo: string) =>
        erro instanceof ApiError ? erro.mensagemDoCampo(campo) : undefined;

    const adicionarFederacao = async () => {
        const nomeDaFederacao = novaFederacao.trim();
        if (!nomeDaFederacao) return;

        setCriandoFederacao(true);
        try {
            const criada = await criarFederacao(nomeDaFederacao);
            setFederacoes((atuais) => [...atuais, criada]);
            setFederacao([String(criada.id)]);
            setNovaFederacao("");
            avisos.sucesso(`Federação ${criada.nome} criada.`);
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setCriandoFederacao(false);
        }
    };

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();

        const idModalidade = modalidade[0] ? Number(modalidade[0]) : undefined;
        const idFederacao =
            federacao[0] && federacao[0] !== SEM_FEDERACAO ? Number(federacao[0]) : undefined;

        setSalvando(true);
        setErro(null);

        try {
            let salva: Equipe;

            if (editando) {
                // Só o que mudou. A API não tem como tirar a federação de uma
                // equipe — `idFederacao` nulo é "não mexe" — então trocar de
                // "Federação X" para "Sem federação" não é uma edição que dê
                // para enviar; a opção existe apenas no cadastro.
                const mudancas: EquipeInput = {};
                if (nome.trim() !== equipe.nome) mudancas.nome = nome.trim();
                if (idModalidade && idModalidade !== equipe.modalidade.id) {
                    mudancas.idModalidade = idModalidade;
                }
                if (idFederacao && idFederacao !== equipe.federacao?.id) {
                    mudancas.idFederacao = idFederacao;
                }

                salva = await atualizarEquipe(equipe.id, mudancas);
                avisos.sucesso(`${salva.nome} atualizada.`);
            } else {
                salva = await criarEquipe({ nome: nome.trim(), idModalidade, idFederacao });
                avisos.sucesso(`${salva.nome} criada.`);
            }

            aoSalvar(salva);
            setAberto(false);
        } catch (causa) {
            setErro(causa instanceof Error ? causa : new Error("Não foi possível salvar."));
            avisos.erro(causa);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={aoAbrir}>
            <DialogTrigger
                render={
                    gatilho ?? (
                        <Button size="sm">
                            <Plus />
                            Nova equipe
                        </Button>
                    )
                }
            />
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editando ? "Editar equipe" : "Nova equipe"}</DialogTitle>
                    <DialogDescription>
                        A equipe existe fora da competição e disputa mais de uma. A modalidade
                        decide de quais competições ela pode participar.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={enviar}
                    className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="equipe-nome">Nome</Label>
                        <Input
                            id="equipe-nome"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Nome da equipe"
                            aria-invalid={!!mensagemDoCampo("nome")}
                            required
                        />
                        {mensagemDoCampo("nome") && (
                            <p role="alert" className="text-xs text-destructive">
                                {mensagemDoCampo("nome")}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Modalidade</Label>
                        {erroDoCatalogo ? (
                            <p role="alert" className="text-xs text-destructive">
                                {erroDoCatalogo}
                            </p>
                        ) : (
                            <ToggleGroup
                                value={modalidade}
                                onValueChange={(valor) => valor.length > 0 && setModalidade(valor)}
                                variant="outline"
                                className="w-full flex-wrap"
                            >
                                {modalidades.map((m) => (
                                    <ToggleGroupItem key={m.id} value={String(m.id)}>
                                        {m.nome}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        )}
                        {mensagemDoCampo("idModalidade") && (
                            <p role="alert" className="text-xs text-destructive">
                                {mensagemDoCampo("idModalidade")}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Federação</Label>
                        <ToggleGroup
                            value={federacao}
                            onValueChange={(valor) => valor.length > 0 && setFederacao(valor)}
                            variant="outline"
                            className="w-full flex-wrap"
                        >
                            {!editando && (
                                <ToggleGroupItem value={SEM_FEDERACAO}>Sem federação</ToggleGroupItem>
                            )}
                            {federacoes.map((f) => (
                                <ToggleGroupItem key={f.id} value={String(f.id)}>
                                    {f.nome}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>

                        {/* Criar a federação aqui mesmo: sem isto, a primeira
                            equipe do sistema não tem federação nenhuma para
                            escolher e a pessoa sai da tela para cadastrar uma. */}
                        <div className="flex items-center gap-2">
                            <Input
                                value={novaFederacao}
                                onChange={(evento) => setNovaFederacao(evento.target.value)}
                                placeholder={
                                    federacoes.length === 0
                                        ? "Nenhuma federação cadastrada — crie a primeira"
                                        : "Criar outra federação"
                                }
                                aria-label="Nome da nova federação"
                                onKeyDown={(evento) => {
                                    if (evento.key !== "Enter") return;
                                    evento.preventDefault();
                                    void adicionarFederacao();
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!novaFederacao.trim() || criandoFederacao}
                                onClick={adicionarFederacao}
                            >
                                {criandoFederacao ? "Criando…" : "Criar"}
                            </Button>
                        </div>
                        {mensagemDoCampo("idFederacao") && (
                            <p role="alert" className="text-xs text-destructive">
                                {mensagemDoCampo("idFederacao")}
                            </p>
                        )}
                    </div>

                    {/* A faixa só entra quando o servidor não disse de qual
                        campo foi a falha — se disse, a mensagem já está no
                        campo e repetir aqui é ruído. */}
                    {erro && (!(erro instanceof ApiError) || erro.detalhes.length === 0) && (
                        <p role="alert" className="text-sm text-destructive">
                            {erro.message}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" disabled={salvando || !nome.trim()}>
                            {salvando ? "Salvando…" : editando ? "Salvar equipe" : "Criar equipe"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
