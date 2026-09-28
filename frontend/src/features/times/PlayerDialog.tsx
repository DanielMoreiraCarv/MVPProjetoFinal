"use client"

import { useEffect, useState } from "react";
import {
    Dialog,
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
import { Atleta } from "@/src/lib/types/atleta";
import { criarAtleta, atualizarAtleta } from "@/src/lib/api/atletas";

interface PlayerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    atleta?: Atleta;
    idEquipe: number;
    onSubmit: (atleta: Atleta) => void;
}

export const PlayerDialog = ({ open, onOpenChange, atleta, idEquipe, onSubmit }: PlayerDialogProps) => {
    const isEditing = !!atleta;

    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [age, setAge] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setErro(null);
            setName(atleta?.nome ?? "");
            setNumber(atleta?.numCamisa?.toString() ?? "");
            setAge(atleta?.idade?.toString() ?? "");
        }
    }, [open, atleta]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        setErro(null);

        try {
            const entrada = {
                nome: name.trim(),
                numCamisa: number ? Number(number) : undefined,
                idade: age ? Number(age) : undefined,
                idEquipe,
            };

            const salvo = isEditing
                ? await atualizarAtleta(atleta.id, entrada)
                : await criarAtleta(entrada);

            onSubmit(salvo);
            onOpenChange(false);
        } catch (causa) {
            setErro(causa instanceof Error ? causa.message : "Não foi possível salvar o atleta.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Jogador" : "Adicionar Jogador"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Edite as informações do jogador." : "Preencha os dados para adicionar um novo jogador."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="atleta-name">Nome *</Label>
                        <Input
                            id="atleta-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome do jogador"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="atleta-number">Número da camisa</Label>
                        <Input
                            id="atleta-number"
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="Ex: 10"
                            min={1}
                            max={99}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="atleta-age">Idade</Label>
                        <Input
                            id="atleta-age"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Ex: 24"
                            min={1}
                        />
                    </div>
                    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                    <DialogFooter>
                        <DialogClose render={<Button className="border border-border bg-card text-foreground hover:bg-muted" />}>
                            Cancelar
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={salvando}
                            className="bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-60"
                        >
                            {salvando ? "Salvando..." : isEditing ? "Salvar" : "Adicionar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
