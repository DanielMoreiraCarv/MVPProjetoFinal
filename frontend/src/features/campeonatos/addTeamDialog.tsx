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
import { Team } from "@/src/lib/types/team";

interface AddTeamDialogProps {
    onAdd: (team: Team) => void;
}

const football = { id: 1, name: "Futebol" as const, description: "Futebol associação" };

export const AddTeamDialog = ({ onAdd }: AddTeamDialogProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const newTeam: Team = {
            id: Date.now(),
            name: name.trim(),
            sport: football,
            players: [],
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
                        <Label htmlFor="team-name">Nome do time *</Label>
                        <Input
                            id="team-name"
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
