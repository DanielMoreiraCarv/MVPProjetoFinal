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
            <DialogTrigger render={<Button className="w-full bg-green-700 text-white hover:bg-green-600" />}>
                + Adicionar Time
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Novo Time</DialogTitle>
                    <DialogDescription>
                        Preencha o nome do time para adicioná-lo à competição.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="equipe-name">Nome do time *</Label>
                        <Input
                            id="equipe-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Leões do Norte"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" className="bg-green-700 text-white hover:bg-green-600">Adicionar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
