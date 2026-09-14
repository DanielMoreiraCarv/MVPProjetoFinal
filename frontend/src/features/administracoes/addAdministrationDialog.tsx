"use client"

import { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tournaments } from "@/src/lib/types/tournaments";
import { criarAdministracao, atualizarAdministracao } from "@/src/lib/api/administracoes";

interface AddAdministrationDialogProps {
    administracao?: Tournaments;
    onSaved?: (administracao: Tournaments) => void;
}

export const AddAdministrationDialog = ({ administracao, onSaved }: AddAdministrationDialogProps) => {
    const editando = !!administracao;
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(administracao?.name ?? "");
    const [description, setDescription] = useState(administracao?.description ?? "");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const aoAbrir = (aberto: boolean) => {
        setOpen(aberto);
        if (aberto) {
            setName(administracao?.name ?? "");
            setDescription(administracao?.description ?? "");
            setErro(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        setErro(null);

        try {
            const entrada = { nome: name.trim(), descricao: description.trim() };
            const salva = editando
                ? await atualizarAdministracao(administracao.id, entrada)
                : await criarAdministracao(entrada);

            onSaved?.(salva);
            setOpen(false);
            if (!editando) {
                setName("");
                setDescription("");
            }
        } catch (causa) {
            setErro(causa instanceof Error ? causa.message : "Não foi possível salvar a administração.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={aoAbrir}>
            <DialogTrigger render={<Button />}>
                {editando ? "Editar" : "+ Nova Administração"}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editando ? "Editar Administração" : "Nova Administração"}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da administração.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="adm-name">Nome</Label>
                        <Input
                            id="adm-name"
                            placeholder="Nome da administração"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="adm-description">Descrição</Label>
                        <Textarea
                            id="adm-description"
                            placeholder="Descrição da administração"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    {erro && (
                        <p role="alert" className="text-sm text-red-600">{erro}</p>
                    )}
                    <DialogFooter>
                        <DialogClose render={<Button className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50" />}>
                            Cancelar
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={salvando}
                            className="bg-green-700 text-white hover:bg-green-600 disabled:opacity-60"
                        >
                            {salvando ? "Salvando..." : editando ? "Salvar" : "Criar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
