"use client";

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
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/src/lib/api/client";
import { Arbitro, atualizarArbitro, criarArbitro } from "@/src/lib/api/arbitros";
import { Federacao, listarFederacoes } from "@/src/lib/api/federacoes";

const SEM_FEDERACAO = "";

/**
 * Criar e editar árbitro no mesmo diálogo: os campos são os mesmos e o que
 * muda é o verbo.
 *
 * A federação vira uma escolha da lista cadastrada, e não texto livre, porque
 * o back-end guarda o nome dela como string solta — texto livre aqui produz
 * "CBF", "C.B.F." e "cbf" como três federações diferentes na listagem.
 */
export const ArbitroDialog = ({
    arbitro,
    aoSalvar,
}: {
    arbitro?: Arbitro;
    aoSalvar: (arbitro: Arbitro) => void;
}) => {
    const editando = !!arbitro;
    const [aberto, setAberto] = useState(false);
    const [federacoes, setFederacoes] = useState<Federacao[]>([]);
    const [nome, setNome] = useState("");
    const [nomeDaFederacao, setNomeDaFederacao] = useState<string>(SEM_FEDERACAO);
    const [categoria, setCategoria] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);
    // Separado do erro de salvar: a lista de federações falhar não é a mesma
    // coisa que o cadastro ser recusado, e ler "Failed to fetch" embaixo do
    // botão Criar diz a coisa errada.
    const [erroDasFederacoes, setErroDasFederacoes] = useState<unknown>(null);

    useEffect(() => {
        if (!aberto) return;
        setErroDasFederacoes(null);
        listarFederacoes().then(setFederacoes).catch(setErroDasFederacoes);
    }, [aberto]);

    const aoAbrir = (proximo: boolean) => {
        setAberto(proximo);
        if (proximo) {
            setNome(arbitro?.nome ?? "");
            setNomeDaFederacao(arbitro?.federacao ?? SEM_FEDERACAO);
            setCategoria(arbitro?.categoria ?? "");
            setErro(null);
        }
    };

    const mensagemDoCampo = (campo: string) =>
        erro instanceof ApiError ? erro.mensagemDoCampo(campo) : undefined;

    const mensagemGeral =
        erro instanceof ApiError
            ? erro.detalhes.length > 0
                ? undefined
                : erro.message
            : erro instanceof Error
              ? erro.message
              : undefined;

    const salvar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        setErro(null);

        const entrada = {
            nome: nome.trim(),
            federacao: nomeDaFederacao === SEM_FEDERACAO ? undefined : nomeDaFederacao.trim(),
            categoria: categoria.trim(),
        };

        try {
            const salvo = editando
                ? await atualizarArbitro(arbitro.id, entrada)
                : await criarArbitro(entrada);
            aoSalvar(salvo);
            setAberto(false);
        } catch (causa) {
            setErro(causa);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={aoAbrir}>
            <DialogTrigger
                render={
                    editando ? (
                        <Button
                            variant="ghost"
                            size="xs"
                            aria-label={`Editar ${arbitro.nome}`}
                        />
                    ) : (
                        <Button size="sm" />
                    )
                }
            >
                {editando ? "Editar" : "Novo árbitro"}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editando ? "Editar árbitro" : "Novo árbitro"}</DialogTitle>
                    <DialogDescription>
                        A federação sai da lista de federações cadastradas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={salvar} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="arbitro-nome">Nome</Label>
                        <Input
                            id="arbitro-nome"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Nome do árbitro"
                            required
                            aria-invalid={!!mensagemDoCampo("nome")}
                        />
                        {mensagemDoCampo("nome") && (
                            <p role="alert" className="text-sm text-destructive">
                                {mensagemDoCampo("nome")}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="arbitro-federacao">Federação</Label>
                        <Select
                            value={nomeDaFederacao}
                            onValueChange={(valor) => setNomeDaFederacao(valor ?? SEM_FEDERACAO)}
                            items={[
                                { label: "Sem federação", value: SEM_FEDERACAO },
                                ...federacoes.map((federacao) => ({
                                    label: federacao.nome,
                                    value: federacao.nome,
                                })),
                            ]}
                        >
                            <SelectTrigger id="arbitro-federacao">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectPopup>
                                <SelectItem value={SEM_FEDERACAO}>Sem federação</SelectItem>
                                {federacoes.map((federacao) => (
                                    <SelectItem key={federacao.id} value={federacao.nome}>
                                        {federacao.nome}
                                    </SelectItem>
                                ))}
                            </SelectPopup>
                        </Select>
                        {erroDasFederacoes ? (
                            <p role="alert" className="text-xs text-destructive">
                                Não foi possível carregar as federações:{" "}
                                {erroDasFederacoes instanceof Error
                                    ? erroDasFederacoes.message
                                    : "tente de novo em instantes."}
                            </p>
                        ) : (
                            federacoes.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Nenhuma federação cadastrada ainda — elas são criadas em
                                    Cadastros.
                                </p>
                            )
                        )}
                        {mensagemDoCampo("federacao") && (
                            <p role="alert" className="text-sm text-destructive">
                                {mensagemDoCampo("federacao")}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="arbitro-categoria">Categoria</Label>
                        <Input
                            id="arbitro-categoria"
                            value={categoria}
                            onChange={(evento) => setCategoria(evento.target.value)}
                            placeholder="Categoria do árbitro"
                            required
                            aria-invalid={!!mensagemDoCampo("categoria")}
                        />
                        <p className="text-xs text-muted-foreground">
                            A API grava a categoria, mas não a devolve na leitura — por isso
                            ela vem em branco aqui e precisa ser informada de novo.
                        </p>
                        {mensagemDoCampo("categoria") && (
                            <p role="alert" className="text-sm text-destructive">
                                {mensagemDoCampo("categoria")}
                            </p>
                        )}
                    </div>

                    {mensagemGeral && (
                        <p role="alert" className="text-sm text-destructive">
                            {mensagemGeral}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                        <Button type="submit" disabled={salvando}>
                            {salvando ? "Salvando…" : editando ? "Salvar" : "Criar árbitro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
