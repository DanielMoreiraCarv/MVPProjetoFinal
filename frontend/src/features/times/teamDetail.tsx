"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Player } from "@/src/lib/types/player";
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
import { listarAtletasDoTime, removerAtleta } from "@/src/lib/api/atletas";
import { buscarTime } from "@/src/lib/api/times";
import { Team } from "@/src/lib/types/team";

export const TeamDetail = () => {
    const params = useParams<{ teamId: string }>();
    const teamId = Number(params?.teamId);

    const [team, setTeam] = useState<Team | null>(null);

    const [players, setPlayers] = useState<Player[]>([]);
    const [carregandoAtletas, setCarregandoAtletas] = useState(true);
    const [erroAtletas, setErroAtletas] = useState<string | null>(null);
    const [teamName, setTeamName] = useState("");

    const [renameOpen, setRenameOpen] = useState(false);
    const [renameValue, setRenameValue] = useState("");

    const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | undefined>(undefined);

    useEffect(() => {
        if (!Number.isFinite(teamId)) return;

        setCarregandoAtletas(true);
        buscarTime(teamId)
            .then((encontrado) => {
                setTeam(encontrado);
                setTeamName(encontrado.name);
                return listarAtletasDoTime(teamId);
            })
            .then(setPlayers)
            .catch((causa) =>
                setErroAtletas(causa instanceof Error ? causa.message : "Não foi possível carregar o elenco."))
            .finally(() => setCarregandoAtletas(false));
    }, [teamId]);

    if (carregandoAtletas && !team) {
        return (
            <div className="p-8">
                <div className="bg-white shadow-sm rounded-lg p-4">Carregando time...</div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="p-8">
                <div className="bg-white shadow-sm rounded-lg p-4">
                    {erroAtletas ?? "Time não encontrado."}
                </div>
            </div>
        );
    }

    const handleOpenAddPlayer = () => {
        setEditingPlayer(undefined);
        setPlayerDialogOpen(true);
    };

    const handleOpenEditPlayer = (player: Player) => {
        setEditingPlayer(player);
        setPlayerDialogOpen(true);
    };

    const handlePlayerSubmit = (updated: Player) => {
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
        <div className="p-8 flex flex-col gap-6 text-black">
            <div className="flex items-center gap-3">
                <Link href="/administracoes" className="text-sm text-gray-500 hover:text-black transition-colors">
                    ← Administrações
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{teamName}</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {team.sport.name} · {players.length} jogador{players.length !== 1 ? "es" : ""}
                    </p>
                </div>
                <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                    <DialogTrigger render={<Button size="sm" className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" />} onClick={handleRenameOpen}>
                        Renomear
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Renomear Time</DialogTitle>
                            <DialogDescription>Informe o novo nome para o time.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="team-rename">Nome do time *</Label>
                                <Input
                                    id="team-rename"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    placeholder="Novo nome"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose render={<Button className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50" />}>Cancelar</DialogClose>
                                <Button type="submit" className="bg-green-700 text-white hover:bg-green-600">Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Jogadores</h2>
                    <Button size="sm" onClick={handleOpenAddPlayer} className="bg-green-700 text-white hover:bg-green-600">+ Adicionar Jogador</Button>
                </div>
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                                        Nenhum jogador cadastrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                players.map((player) => (
                                    <TableRow key={player.id}>
                                        <TableCell className="text-gray-500">{player.number ?? "—"}</TableCell>
                                        <TableCell className="font-medium">{player.name}</TableCell>
                                        <TableCell className="text-gray-500">{player.age ?? "—"}</TableCell>
                                        <TableCell>
                                            <Badge variant={player.suspended ? "destructive" : "secondary"}>
                                                {player.suspended ? "Suspenso" : "Ativo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEditPlayer(player)}
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemovePlayer(player.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                idTime={teamId}
                open={playerDialogOpen}
                onOpenChange={setPlayerDialogOpen}
                player={editingPlayer}
                onSubmit={handlePlayerSubmit}
            />
        </div>
    );
};
