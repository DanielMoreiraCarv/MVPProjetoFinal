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
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/lib/api/client";
import { criarPartida } from "@/src/lib/api/partidas";
import { useAvisos } from "@/src/lib/avisos";
import { Equipe } from "@/src/lib/types/equipe";
import { Partida } from "@/src/lib/types/partida";

import { paraIsoComFuso } from "./agendamento";

const classeDeEscolha =
    "h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm text-foreground outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive disabled:opacity-50";

/**
 * Uma partida fora do que a fase gerou — amistoso, jogo remarcado em outra
 * chave, confronto acertado à mão.
 *
 * Só oferece as equipes inscritas: a API recusa quem não está, e a recusa dela
 * é mais útil como último anteparo do que como primeira notícia.
 */
export const CriarPartidaDialog = ({
    idCompeticao,
    equipes,
    aoCriar,
}: {
    idCompeticao: number;
    equipes: Equipe[];
    aoCriar: (partida: Partida) => void;
}) => {
    const [aberto, setAberto] = useState(false);
    const [mandante, setMandante] = useState("");
    const [visitante, setVisitante] = useState("");
    const [dia, setDia] = useState("");
    const [hora, setHora] = useState("");
    const [local, setLocal] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);
    const avisos = useAvisos();

    const aoAbrir = (abrindo: boolean) => {
        setAberto(abrindo);
        if (!abrindo) return;
        setMandante("");
        setVisitante("");
        setDia("");
        setHora("");
        setLocal("");
        setErro(null);
    };

    const mesmaEquipe = mandante !== "" && mandante === visitante;

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        if (mesmaEquipe) return;

        setSalvando(true);
        setErro(null);
        try {
            const criada = await criarPartida({
                idCompeticao,
                idEquipeMandante: Number(mandante),
                idEquipeVisitante: Number(visitante),
                dataHora: paraIsoComFuso(dia, hora) ?? undefined,
                local: local.trim() || undefined,
            });
            aoCriar(criada);
            avisos.sucesso("Partida criada.");
            setAberto(false);
        } catch (causa) {
            // Equipe não inscrita e mandante igual ao visitante chegam aqui
            // com a razão escrita pelo servidor; é ela que aparece na tela.
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
            <DialogTrigger render={<Button size="sm" />}>Criar partida</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Criar partida</DialogTitle>
                    <DialogDescription>
                        Escolha as duas equipes inscritas. O dia, a hora e o local podem ficar
                        para depois.
                    </DialogDescription>
                </DialogHeader>

                {equipes.length < 2 ? (
                    <p className="text-sm text-muted-foreground">
                        A competição precisa de pelo menos duas equipes inscritas para ter
                        partida.
                    </p>
                ) : (
                    <form onSubmit={enviar} className="flex flex-col gap-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="criar-mandante">Mandante</Label>
                                <select
                                    id="criar-mandante"
                                    value={mandante}
                                    onChange={(evento) => setMandante(evento.target.value)}
                                    className={classeDeEscolha}
                                    aria-invalid={
                                        doCampo("idEquipeMandante") ? true : undefined
                                    }
                                    required
                                >
                                    <option value="">Escolha a equipe…</option>
                                    {equipes.map((equipe) => (
                                        <option key={equipe.id} value={equipe.id}>
                                            {equipe.nome}
                                        </option>
                                    ))}
                                </select>
                                {doCampo("idEquipeMandante") && (
                                    <p role="alert" className="text-sm text-destructive">
                                        {doCampo("idEquipeMandante")}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="criar-visitante">Visitante</Label>
                                <select
                                    id="criar-visitante"
                                    value={visitante}
                                    onChange={(evento) => setVisitante(evento.target.value)}
                                    className={cn(
                                        classeDeEscolha,
                                        mesmaEquipe && "border-destructive",
                                    )}
                                    aria-invalid={
                                        mesmaEquipe || doCampo("idEquipeVisitante")
                                            ? true
                                            : undefined
                                    }
                                    required
                                >
                                    <option value="">Escolha a equipe…</option>
                                    {equipes.map((equipe) => (
                                        <option key={equipe.id} value={equipe.id}>
                                            {equipe.nome}
                                        </option>
                                    ))}
                                </select>
                                {(mesmaEquipe || doCampo("idEquipeVisitante")) && (
                                    <p role="alert" className="text-sm text-destructive">
                                        {mesmaEquipe
                                            ? "A equipe visitante deve ser diferente da mandante."
                                            : doCampo("idEquipeVisitante")}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="criar-dia">Dia</Label>
                                <Input
                                    id="criar-dia"
                                    type="date"
                                    value={dia}
                                    onChange={(evento) => setDia(evento.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="criar-hora">Hora</Label>
                                <Input
                                    id="criar-hora"
                                    type="time"
                                    value={hora}
                                    onChange={(evento) => setHora(evento.target.value)}
                                />
                            </div>
                        </div>
                        {doCampo("dataHora") && (
                            <p role="alert" className="text-sm text-destructive">
                                {doCampo("dataHora")}
                            </p>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="criar-local">Local</Label>
                            <Input
                                id="criar-local"
                                placeholder="Quadra, ginásio, endereço…"
                                value={local}
                                onChange={(evento) => setLocal(evento.target.value)}
                            />
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
                            <Button type="submit" disabled={salvando || mesmaEquipe}>
                                {salvando ? "Aguarde…" : "Criar partida"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};
