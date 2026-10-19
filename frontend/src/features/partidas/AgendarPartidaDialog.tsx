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
import { agendarPartida } from "@/src/lib/api/partidas";
import { ApiError } from "@/src/lib/api/client";
import { useAvisos } from "@/src/lib/avisos";
import { Partida } from "@/src/lib/types/partida";

import { paraCamposDeAgendamento, paraIsoComFuso } from "./agendamento";

/** Dia, hora e lugar. Já aberto preenchido quando a partida tem agendamento. */
export const AgendarPartidaDialog = ({
    partida,
    aoAgendar,
    gatilho,
}: {
    partida: Partida;
    aoAgendar: (partida: Partida) => void;
    gatilho?: React.ReactElement;
}) => {
    const [aberto, setAberto] = useState(false);
    const [dia, setDia] = useState("");
    const [hora, setHora] = useState("");
    const [local, setLocal] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);
    const avisos = useAvisos();

    const aoAbrir = (abrindo: boolean) => {
        setAberto(abrindo);
        if (!abrindo) return;
        const campos = paraCamposDeAgendamento(partida.dataHora);
        setDia(campos.dia);
        setHora(campos.hora);
        setLocal(partida.local ?? "");
        setErro(null);
    };

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();

        const dataHora = paraIsoComFuso(dia, hora);
        if (!dataHora) {
            setErro(new Error("Informe o dia e a hora da partida."));
            return;
        }

        setSalvando(true);
        setErro(null);
        try {
            const agendada = await agendarPartida(partida.id, dataHora, local.trim() || undefined);
            aoAgendar(agendada);
            avisos.sucesso("Partida agendada.");
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
            <DialogTrigger render={gatilho ?? <Button variant="outline" size="sm" />}>
                {partida.dataHora ? "Reagendar" : "Agendar"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {partida.dataHora ? "Reagendar partida" : "Agendar partida"}
                    </DialogTitle>
                    <DialogDescription>
                        {partida.equipeMandante} × {partida.equipeVisitante}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="agendar-dia">Dia</Label>
                            <Input
                                id="agendar-dia"
                                type="date"
                                value={dia}
                                onChange={(evento) => setDia(evento.target.value)}
                                aria-invalid={doCampo("dataHora") ? true : undefined}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="agendar-hora">Hora</Label>
                            <Input
                                id="agendar-hora"
                                type="time"
                                value={hora}
                                onChange={(evento) => setHora(evento.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {doCampo("dataHora") && (
                        <p role="alert" className="text-sm text-destructive">
                            {doCampo("dataHora")}
                        </p>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="agendar-local">Local</Label>
                        <Input
                            id="agendar-local"
                            placeholder="Quadra, ginásio, endereço…"
                            value={local}
                            onChange={(evento) => setLocal(evento.target.value)}
                            aria-invalid={doCampo("local") ? true : undefined}
                        />
                        {doCampo("local") && (
                            <p role="alert" className="text-sm text-destructive">
                                {doCampo("local")}
                            </p>
                        )}
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
                            {salvando ? "Aguarde…" : "Salvar agendamento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
