"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Atleta } from "@/src/lib/types/atleta";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { PlayerDialog } from "@/src/features/times/PlayerDialog";
import { listarAtletasDaEquipe, removerAtleta } from "@/src/lib/api/atletas";
import { buscarEquipe } from "@/src/lib/api/equipes";
import { Equipe } from "@/src/lib/types/equipe";

export const TeamDetail = () => {
    const params = useParams<{ teamId: string }>();
    const teamId = Number(params?.teamId);

    const [equipe, setTeam] = useState<Equipe | null>(null);

    const [players, setPlayers] = useState<Atleta[]>([]);
    const [carregandoAtletas, setCarregandoAtletas] = useState(true);
    const [erroAtletas, setErroAtletas] = useState<string | null>(null);
    const [teamName, setTeamName] = useState("");

    const [renameOpen, setRenameOpen] = useState(false);
    const [renameValue, setRenameValue] = useState("");

    const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Atleta | undefined>(undefined);

    useEffect(() => {
        if (!Number.isFinite(teamId)) return;

        setCarregandoAtletas(true);
        buscarEquipe(teamId)
            .then((encontrado) => {
                setTeam(encontrado);
                setTeamName(encontrado.nome);
                return listarAtletasDaEquipe(teamId);
            })
            .then(setPlayers)
            .catch((causa) =>
                setErroAtletas(causa instanceof Error ? causa.message : "Não foi possível carregar o elenco."))
            .finally(() => setCarregandoAtletas(false));
    }, [teamId]);

    if (carregandoAtletas && !equipe) {
        return (
            <div className="p-8">
                <div className="bg-card shadow-sm rounded-lg p-4">Carregando time...</div>
            </div>
        );
    }

    if (!equipe) {
        return (
            <div className="p-8">
                <div className="bg-card shadow-sm rounded-lg p-4">
                    {erroAtletas ?? "Time não encontrado."}
                </div>
            </div>
        );
    }

    const handleOpenAddPlayer = () => {
        setEditingPlayer(undefined);
        setPlayerDialogOpen(true);
    };

    const handleOpenEditPlayer = (atleta: Atleta) => {
        setEditingPlayer(atleta);
        setPlayerDialogOpen(true);
    };

    const handlePlayerSubmit = (updated: Atleta) => {
        if (editingPlayer) {
            setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        } else {
            setPlayers((prev) => [...prev, updated]);
        }
    };

    const handleRemovePlayer = async (playerId: number) => {
        try {
            await removerAtleta(playerId);
            setPlayers((prev) => prev.filter((p) => p.id !== playerId));
        } catch (causa) {
            setErroAtletas(causa instanceof Error ? causa.message : "Não foi possível remover o atleta.");
        }
    };

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (renameValue.trim()) {
            setTeamName(renameValue.trim());
        }
        setRenameOpen(false);
    };

    const handleRenameOpen = () => {
        setRenameValue(teamName);
        setRenameOpen(true);
    };

    return (
        <div className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Link href="/administracoes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← Administrações
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{teamName}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {equipe.modalidade.nome} · {players.length} jogador{players.length !== 1 ? "es" : ""}
                    </p>
                </div>
                <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                    <DialogTrigger render={<Button size="sm" className="border border-border bg-card text-foreground hover:bg-muted" />} onClick={handleRenameOpen}>
                        Renomear
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Renomear Time</DialogTitle>
                            <DialogDescription>Informe o novo nome para o time.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="equipe-rename">Nome do time *</Label>
                                <Input
                                    id="equipe-rename"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    placeholder="Novo nome"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose render={<Button className="border border-border bg-card text-foreground hover:bg-muted" />}>Cancelar</DialogClose>
                                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/85">Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Jogadores</h2>
                    <Button size="sm" onClick={handleOpenAddPlayer} className="bg-primary text-primary-foreground hover:bg-primary/85">+ Adicionar Jogador</Button>
                </div>
                <div className="bg-card shadow-sm rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead className="w-24">Idade</TableHead>
                                <TableHead className="w-28">Status</TableHead>
                                <TableHead className="w-36" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {players.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Nenhum jogador cadastrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                players.map((atleta) => (
                                    <TableRow key={atleta.id}>
                                        <TableCell className="text-muted-foreground">{atleta.numCamisa ?? "—"}</TableCell>
                                        <TableCell className="font-medium">{atleta.nome}</TableCell>
                                        <TableCell className="text-muted-foreground">{atleta.idade ?? "—"}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                Ativo
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEditPlayer(atleta)}
                                                    className="text-primary hover:text-primary hover:bg-primary/10"
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemovePlayer(atleta.id)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <PlayerDialog
                idEquipe={teamId}
                open={playerDialogOpen}
                onOpenChange={setPlayerDialogOpen}
                atleta={editingPlayer}
                onSubmit={handlePlayerSubmit}
            />
        </div>
    );
};
