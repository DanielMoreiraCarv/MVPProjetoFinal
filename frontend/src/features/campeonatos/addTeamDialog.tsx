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
import { Equipe } from "@/src/lib/types/equipe";

interface AddTeamDialogProps {
    onAdd: (equipe: Equipe) => void;
}

const football = { id: 1, nome: "Futebol" as const, atletasEmQuadra: 0 };

export const AddTeamDialog = ({ onAdd }: AddTeamDialogProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const newTeam: Equipe = {
            id: Date.now(),
            nome: name.trim(),
            modalidade: football,
            atletas: [],
        };
        onAdd(newTeam);
        setName("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm" />}>Inscrever equipe</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Inscrever equipe</DialogTitle>
                    <DialogDescription>
                        Informe o nome da equipe para inscrevê-la nesta competição.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="equipe-name">Nome da equipe *</Label>
                        <Input
                            id="equipe-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Leões do Norte"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button className="border border-border bg-card text-foreground hover:bg-muted" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/85">Adicionar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
