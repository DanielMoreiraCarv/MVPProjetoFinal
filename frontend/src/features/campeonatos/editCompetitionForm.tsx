"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Competition } from "@/src/lib/types/competition";

interface EditCompetitionFormProps {
    competition: Competition;
}

export const EditCompetitionForm = ({ competition }: EditCompetitionFormProps) => {
    const [name, setName] = useState(competition.name);
    const [description, setDescription] = useState(competition.description);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mocked: no real state change
        console.log("Dados atualizados (mock):", { name, description });
        alert("Dados atualizados com sucesso! (mock)");
    };

    return (
        <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="comp-name">Nome</Label>
                    <Input
                        id="comp-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="comp-description">Descrição</Label>
                    <Textarea
                        id="comp-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </div>
    );
};
