"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Competicao } from "@/src/lib/types/competicao";
import { atualizarCompeticao } from "@/src/lib/api/competicoes";

interface EditCompetitionFormProps {
    competicao: Competicao;
    onSaved?: (competicao: Competicao) => void;
}

export const EditCompetitionForm = ({ competicao, onSaved }: EditCompetitionFormProps) => {
    const [name, setName] = useState(competicao.nome);
    const [description, setDescription] = useState(competicao.descricao);

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [salvo, setSalvo] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!competicao.idAdministracao) {
            setErro("Competição sem administração vinculada. Recarregue a página.");
            return;
        }

        setSalvando(true);
        setErro(null);
        setSalvo(false);

        try {
            const atualizada = await atualizarCompeticao(competicao.id, {
                nome: name.trim(),
                descricao: description.trim(),
                categoria: competicao.categoria ?? "",
                idAdministracao: competicao.idAdministracao,
                modalidadesIds: competicao.modalidadeId ? [competicao.modalidadeId] : [],
                isMataMata: competicao.isMataMata ?? false,
            });

            onSaved?.(atualizada);
            setSalvo(true);
        } catch (causa) {
            setErro(causa instanceof Error ? causa.message : "Não foi possível salvar a competição.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="flex-1">
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
                {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                {salvo && <p className="text-sm text-primary">Dados atualizados.</p>}
                <div className="flex justify-end">
                    <Button type="submit" disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
