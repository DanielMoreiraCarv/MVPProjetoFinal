"use client";

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
import { atualizarPlacar } from "@/src/lib/api/partidas";
import { useAvisos } from "@/src/lib/avisos";
import { Partida } from "@/src/lib/types/partida";

/** O placar enquanto a partida corre. Depois de encerrada a API recusa. */
export const RegistrarPlacarDialog = ({
    partida,
    aoRegistrar,
}: {
    partida: Partida;
    aoRegistrar: (partida: Partida) => void;
}) => {
    const [aberto, setAberto] = useState(false);
    const [mandante, setMandante] = useState("0");
    const [visitante, setVisitante] = useState("0");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);
    const avisos = useAvisos();

    const aoAbrir = (abrindo: boolean) => {
        setAberto(abrindo);
        if (!abrindo) return;
        setMandante(String(partida.placarMandante ?? 0));
        setVisitante(String(partida.placarVisitante ?? 0));
        setErro(null);
    };

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        setErro(null);
        try {
            const atualizada = await atualizarPlacar(
                partida.id,
                Number(mandante),
                Number(visitante),
            );
            aoRegistrar(atualizada);
            avisos.sucesso("Placar registrado.");
            setAberto(false);
        } catch (causa) {
            setErro(causa);
            avisos.erro(causa);
        } finally {
            setSalvando(false);
        }
    };

    const doCampo = (campo: string) =>
        erro instanceof ApiError ? erro.mensagemDoCampo(campo) : undefined;
    const mensagemGeral =
        erro instanceof ApiError
            ? erro.detalhes.length === 0
                ? erro.message
                : undefined
            : erro instanceof Error
              ? erro.message
              : undefined;

    return (
        <Dialog open={aberto} onOpenChange={aoAbrir}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
                Registrar placar
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar placar</DialogTitle>
                    <DialogDescription>
                        Dá para corrigir quantas vezes quiser até a partida ser encerrada.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="placar-mandante">{partida.equipeMandante}</Label>
                            <Input
                                id="placar-mandante"
                                type="number"
                                min={0}
                                inputMode="numeric"
                                className="numero-tabular font-mono"
                                value={mandante}
                                onChange={(evento) => setMandante(evento.target.value)}
                                aria-invalid={doCampo("placarMandante") ? true : undefined}
                                required
                            />
                            {doCampo("placarMandante") && (
                                <p role="alert" className="text-sm text-destructive">
                                    {doCampo("placarMandante")}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="placar-visitante">{partida.equipeVisitante}</Label>
                            <Input
                                id="placar-visitante"
                                type="number"
                                min={0}
                                inputMode="numeric"
                                className="numero-tabular font-mono"
                                value={visitante}
                                onChange={(evento) => setVisitante(evento.target.value)}
                                aria-invalid={doCampo("placarVisitante") ? true : undefined}
                                required
                            />
                            {doCampo("placarVisitante") && (
                                <p role="alert" className="text-sm text-destructive">
                                    {doCampo("placarVisitante")}
                                </p>
                            )}
                        </div>
                    </div>

                    {mensagemGeral && (
                        <p role="alert" className="text-sm text-destructive">
                            {mensagemGeral}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" type="button" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" disabled={salvando}>
                            {salvando ? "Aguarde…" : "Registrar placar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
