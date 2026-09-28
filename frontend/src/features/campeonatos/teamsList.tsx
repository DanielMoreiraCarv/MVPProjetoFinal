"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Equipe } from "@/src/lib/types/equipe";

// Só a lista: o respiro e o estado vazio são da seção que a contém. O painel
// de fundo que havia aqui punha um cartão dentro de outro cartão e deixava
// esta coluna com espaçamento diferente da vizinha.
export const TeamsList = ({ equipes = [] }: { equipes?: Equipe[] }) => (
    <div className="space-y-2">
        {equipes.map((equipe) => (
            <Link key={equipe.id} href={`/equipe/${equipe.id}`} className="block">
                <Card className="transition-colors hover:border-ring">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2 text-sm">
                            <span className="min-w-0 truncate">{equipe.nome}</span>
                            <Badge variant="secondary">
                                {equipe.atletas.length}{" "}
                                {equipe.atletas.length === 1 ? "atleta" : "atletas"}
                            </Badge>
                        </CardTitle>
                        <CardDescription>{equipe.modalidade.nome}</CardDescription>
                    </CardHeader>
                </Card>
            </Link>
        ))}
    </div>
);
