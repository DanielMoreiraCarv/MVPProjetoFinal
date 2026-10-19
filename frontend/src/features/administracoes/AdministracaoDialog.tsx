"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/src/lib/api/client";
import { atualizarAdministracao, criarAdministracao } from "@/src/lib/api/administracoes";
import { Administracao } from "@/src/lib/types/administracao";

export const AdministracaoDialog = ({
    administracao,
    aoSalvar,
    gatilho,
}: {
    administracao?: Administracao;
    aoSalvar?: (administracao: Administracao) => void;
    gatilho?: React.ReactElement;
}) => {
    const editando = !!administracao;
    const [aberto, setAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    const aoAbrir = (proximo: boolean) => {
        setAberto(proximo);
        if (!proximo) return;
        setNome(administracao?.nome ?? "");
        setDescricao(administracao?.descricao ?? "");
        setErro(null);
    };

    const mensagemDoNome = erro instanceof ApiError ? erro.mensagemDoCampo("nome") : undefined;

    const salvar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        setErro(null);
        try {
            const entrada = { nome: nome.trim(), descricao: descricao.trim() };
            const salva = editando
                ? await atualizarAdministracao(administracao.id, entrada)
                : await criarAdministracao(entrada);
            aoSalvar?.(salva);
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
                    gatilho ?? (
                        <Button size="sm">
                            <Plus />
                            Nova administração
                        </Button>
                    )
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editando ? "Editar administração" : "Nova administração"}
                    </DialogTitle>
                    <DialogDescription>
                        Quem organiza as competições: a escola, a liga, a empresa.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={salvar} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="administracao-nome">Nome</Label>
                        <Input
                            id="administracao-nome"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Nome da administração"
                            aria-invalid={!!mensagemDoNome}
                            required
                        />
                        {mensagemDoNome && (
                            <p role="alert" className="text-xs text-destructive">
                                {mensagemDoNome}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="administracao-descricao">Descrição</Label>
                        <Textarea
                            id="administracao-descricao"
                            value={descricao}
                            onChange={(evento) => setDescricao(evento.target.value)}
                            placeholder="Opcional"
                        />
                    </div>

                    {erro instanceof Error && !mensagemDoNome && (
                        <p role="alert" className="text-sm text-destructive">
                            {erro.message}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" disabled={salvando || !nome.trim()}>
                            {salvando
                                ? "Salvando…"
                                : editando
                                  ? "Salvar administração"
                                  : "Criar administração"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
