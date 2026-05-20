"use client"

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockTeams } from "@/src/features/administracoes/mocks/teams";
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

export const TeamDetail = () => {
    const params = useParams<{ teamId: string }>();
    const teamId = Number(params?.teamId);

    const team = mockTeams.find((t) => t.id === teamId);

    const [players, setPlayers] = useState<Player[]>(team?.players ?? []);
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [age, setAge] = useState("");

    if (!team) {
        return (
            <div className="p-8">
                <div className="bg-white shadow-sm rounded-lg p-4">
                    Time não encontrado.
                </div>
            </div>
        );
    }

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        const newPlayer: Player = {
            id: `p-${Date.now()}`,
            name,
            number: number ? Number(number) : undefined,
            age: age ? Number(age) : undefined,
            suspended: false,
        };
        setPlayers([...players, newPlayer]);
        setName("");
        setNumber("");
        setAge("");
    };

    const handleRemovePlayer = (playerId: string) => {
        setPlayers(players.filter((p) => p.id !== playerId));
    };

    return (
        <div className="p-8 flex flex-col gap-6 text-black">
            <div className="flex items-center gap-3">
                <Link href="/administracoes" className="text-sm text-gray-500 hover:text-black transition-colors">
                    ← Administrações
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {team.sport.name} · {players.length} jogador{players.length !== 1 ? "es" : ""}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Jogadores</h2>
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="w-24">Idade</TableHead>
                                    <TableHead className="w-28">Status</TableHead>
                                    <TableHead className="w-24" />
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemovePlayer(player.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    Remover
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="col-span-1 flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Adicionar Jogador</h2>
                    <div className="bg-white shadow-sm rounded-lg p-4">
                        <form onSubmit={handleAddPlayer} className="flex flex-col gap-4">
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
                            <Button type="submit">Adicionar</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
