"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { Equipe } from "@/src/lib/types/equipe";

/**
 * Uma linha por equipe, e não um cartão: com dezesseis inscritas, os cartões
 * empurravam a classificação para depois de dois mil pixels.
 */
export const ListaDeInscritas = ({
    equipes,
    aoRemover,
}: {
    equipes: Equipe[];
    /** Ausente quando a lista é só de leitura. */
    aoRemover?: (equipe: Equipe) => void | Promise<void>;
}) => (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border">
        {equipes.map((equipe) => (
            <li key={equipe.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                    <Link
                        href={`/equipe/${equipe.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                    >
                        {equipe.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        {equipe.atletas.length}{" "}
                        {equipe.atletas.length === 1 ? "atleta" : "atletas"}
                    </p>
                </div>
                {aoRemover && (
                    <Confirmacao
                        gatilho={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remover ${equipe.nome} da competição`}
                                title="Remover da competição"
                            >
                                <Trash2 />
                            </Button>
                        }
                        titulo={`Remover ${equipe.nome} da competição?`}
                        descricao="A equipe continua cadastrada e segue inscrita nas outras competições. Só sai desta."
                        rotuloDaAcao="Remover da competição"
                        aoConfirmar={() => aoRemover(equipe)}
                    />
                )}
            </li>
        ))}
    </ul>
);
