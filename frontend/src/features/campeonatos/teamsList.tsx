"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { Equipe } from "@/src/lib/types/equipe";

// Só a lista: o respiro e o estado vazio são da seção que a contém.
export const TeamsList = ({
    equipes = [],
    aoRemover,
}: {
    equipes?: Equipe[];
    /** Ausente quando a lista é só de leitura. */
    aoRemover?: (equipe: Equipe) => void | Promise<void>;
}) => (
    <div className="space-y-2">
        {equipes.map((equipe) => (
            <Card key={equipe.id} className="transition-colors hover:border-ring">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-sm">
                        <Link href={`/equipe/${equipe.id}`} className="min-w-0 truncate hover:underline">
                            {equipe.nome}
                        </Link>
                        <span className="flex shrink-0 items-center gap-1">
                            <Badge variant="secondary">
                                {equipe.atletas.length}{" "}
                                {equipe.atletas.length === 1 ? "atleta" : "atletas"}
                            </Badge>
                            {aoRemover && (
                                <Confirmacao
                                    gatilho={
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Remover ${equipe.nome} da competição`}
                                            title="Remover da competição"
                                        >
                                            <Trash2 />
                                        </Button>
                                    }
                                    titulo={`Remover ${equipe.nome} da competição?`}
                                    // Diz o que NÃO acontece: sem isso a pessoa
                                    // hesita, achando que vai apagar a equipe.
                                    descricao="A equipe continua cadastrada e segue inscrita nas outras competições. Só sai desta."
                                    rotuloDaAcao="Remover da competição"
                                    aoConfirmar={() => aoRemover(equipe)}
                                />
                            )}
                        </span>
                    </CardTitle>
                    <CardDescription>{equipe.modalidade.nome}</CardDescription>
                </CardHeader>
            </Card>
        ))}
    </div>
);
