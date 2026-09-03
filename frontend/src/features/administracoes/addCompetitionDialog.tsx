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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@/components/ui/select";
import { sportNameSchema } from "@/src/lib/types/sport";
import { competitionStageNamesSchema } from "@/src/lib/types/competitionStage";

type CompetitionType = "Pontos Corridos" | "Mata-Mata";
type MatchFormat = "Só Ida" | "Ida e Volta";
type Modality = "Masculino" | "Feminino";

const MATA_MATA_STAGES = competitionStageNamesSchema.options.filter(
    (s) => s !== "Pontos Corridos"
);

export const AddCompetitionDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sport, setSport] = useState<string[]>(["Futebol"]);
    const [modality, setModality] = useState<string[]>(["Masculino"]);
    const [compType, setCompType] = useState<string[]>(["Pontos Corridos"]);
    const [initialStage, setInitialStage] = useState<string>("Grupo");
    const [matchFormat, setMatchFormat] = useState<string[]>(["Só Ida"]);

    const isMataMata = compType[0] === "Mata-Mata";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mocked: reset and close
        setName("");
        setDescription("");
        setSport(["Futebol"]);
        setModality(["Masculino"]);
        setCompType(["Pontos Corridos"]);
        setInitialStage("Grupo");
        setMatchFormat(["Só Ida"]);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                + Nova Competição
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nova Competição</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para criar uma nova competição.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-1">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="comp-name">Nome</Label>
                        <Input
                            id="comp-name"
                            placeholder="Nome da competição"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="comp-description">Descrição</Label>
                        <Textarea
                            id="comp-description"
                            placeholder="Descrição da competição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Esporte</Label>
                        <ToggleGroup
                            value={sport}
                            onValueChange={(v) => v.length > 0 && setSport(v)}
                            spacing={0}
                            variant="outline"
                            className="w-full"
                        >
                            {sportNameSchema.options.map((s) => (
                                <ToggleGroupItem key={s} value={s} className="flex-1">
                                    {s}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Modalidade</Label>
                        <ToggleGroup
                            value={modality}
                            onValueChange={(v) => v.length > 0 && setModality(v)}
                            spacing={0}
                            variant="outline"
                            className="w-full"
                        >
                            {(["Masculino", "Feminino"] as Modality[]).map((m) => (
                                <ToggleGroupItem key={m} value={m} className="flex-1">
                                    {m}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Tipo de Competição</Label>
                        <ToggleGroup
                            value={compType}
                            onValueChange={(v) => v.length > 0 && setCompType(v)}
                            spacing={0}
                            variant="outline"
                            className="w-full"
                        >
                            {(["Pontos Corridos", "Mata-Mata"] as CompetitionType[]).map((t) => (
                                <ToggleGroupItem key={t} value={t} className="flex-1">
                                    {t}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    {isMataMata && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Fase Inicial</Label>
                            <Select value={initialStage} onValueChange={(v) => v !== null && setInitialStage(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a fase inicial" />
                                </SelectTrigger>
                                <SelectPopup>
                                    {MATA_MATA_STAGES.map((stage) => (
                                        <SelectItem key={stage} value={stage}>
                                            {stage}
                                        </SelectItem>
                                    ))}
                                </SelectPopup>
                            </Select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label>Confrontos</Label>
                        <ToggleGroup
                            value={matchFormat}
                            onValueChange={(v) => v.length > 0 && setMatchFormat(v)}
                            spacing={0}
                            variant="outline"
                            className="w-full"
                        >
                            {(["Só Ida", "Ida e Volta"] as MatchFormat[]).map((f) => (
                                <ToggleGroupItem key={f} value={f} className="flex-1">
                                    {f}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" className="bg-green-700 text-white hover:bg-green-600">Criar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
