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
import { ApiError } from "@/src/lib/api/client";
import { Federacao, atualizarFederacao, criarFederacao } from "@/src/lib/api/federacoes";

/** A federação tem um campo só, então criar e editar cabem no mesmo diálogo. */
export const FederacaoDialog = ({
    federacao,
    aoSalvar,
}: {
    federacao?: Federacao;
    aoSalvar: (federacao: Federacao) => void;
}) => {
    const editando = !!federacao;
    const [aberto, setAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    const aoAbrir = (proximo: boolean) => {
        setAberto(proximo);
        if (proximo) {
            setNome(federacao?.nome ?? "");
            setErro(null);
        }
    };

    const mensagemDoCampo =
        erro instanceof ApiError ? erro.mensagemDoCampo("nome") : undefined;
    const mensagemGeral =
        !mensagemDoCampo && erro instanceof Error ? erro.message : undefined;

    const salvar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        setErro(null);

        try {
            const salva = editando
                ? await atualizarFederacao(federacao.id, nome.trim())
                : await criarFederacao(nome.trim());
            aoSalvar(salva);
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
                            aria-label={`Editar ${federacao.nome}`}
                        />
                    ) : (
                        <Button size="sm" />
                    )
                }
            >
                {editando ? "Editar" : <><Plus />Nova federação</>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editando ? "Editar federação" : "Nova federação"}
                    </DialogTitle>
                    <DialogDescription>
                        A federação é quem as equipes e os árbitros declaram representar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={salvar} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="federacao-nome">Nome</Label>
                        <Input
                            id="federacao-nome"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Nome da federação"
                            required
                            aria-invalid={!!mensagemDoCampo}
                        />
                        {mensagemDoCampo && (
                            <p role="alert" className="text-sm text-destructive">
                                {mensagemDoCampo}
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
                            {salvando ? "Salvando…" : editando ? "Salvar" : "Criar federação"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
