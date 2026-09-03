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
import { Player } from "@/src/lib/types/player";

interface PlayerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    player?: Player;
    onSubmit: (player: Player) => void;
}

export const PlayerDialog = ({ open, onOpenChange, player, onSubmit }: PlayerDialogProps) => {
    const isEditing = !!player;

    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [age, setAge] = useState("");

    useEffect(() => {
        if (open) {
            setName(player?.name ?? "");
            setNumber(player?.number?.toString() ?? "");
            setAge(player?.age?.toString() ?? "");
        }
    }, [open, player]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result: Player = {
            id: player?.id ?? `p-${Date.now()}`,
            name,
            number: number ? Number(number) : undefined,
            age: age ? Number(age) : undefined,
            suspended: player?.suspended ?? false,
        };
        onSubmit(result);
        onOpenChange(false);
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
                        <Label htmlFor="player-name">Nome *</Label>
                        <Input
                            id="player-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome do jogador"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="player-number">Número da camisa</Label>
                        <Input
                            id="player-number"
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="Ex: 10"
                            min={1}
                            max={99}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="player-age">Idade</Label>
                        <Input
                            id="player-age"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Ex: 24"
                            min={1}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" className="bg-green-700 text-white hover:bg-green-600">{isEditing ? "Salvar" : "Adicionar"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
