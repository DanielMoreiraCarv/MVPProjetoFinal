"use client";

import { LogOut, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { AtletaDialog } from "@/src/features/equipes/AtletaDialog";
import { ICONES } from "@/src/lib/icones";
import { Atleta } from "@/src/lib/types/atleta";

/**
 * Só a lista: o respiro e o estado vazio são da seção que a contém.
 *
 * As duas saídas do elenco ficam lado a lado de propósito, com verbos
 * diferentes: sair da equipe mantém o cadastro do atleta, excluir apaga a
 * pessoa. Eram a mesma "Remover" antes, e a única que existia apagava o
 * cadastro sem avisar.
 */
export const ElencoList = ({
    atletas,
    idEquipe,
    idModalidadeDaEquipe,
    nomeDaEquipe,
    aoSalvarAtleta,
    aoRemoverDoElenco,
    aoExcluirAtleta,
}: {
    atletas: Atleta[];
    idEquipe: number;
    idModalidadeDaEquipe?: number;
    nomeDaEquipe: string;
    aoSalvarAtleta: (atleta: Atleta) => void;
    aoRemoverDoElenco: (atleta: Atleta) => void | Promise<void>;
    aoExcluirAtleta: (atleta: Atleta) => void | Promise<void>;
}) => {
    const IconeAtleta = ICONES.atleta;

    return (
        <div className="space-y-2">
            {atletas.map((atleta) => (
                <Card key={atleta.id} className="transition-colors hover:border-ring">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2 text-sm">
                            <span className="flex min-w-0 items-center gap-2">
                                <IconeAtleta className="size-4 shrink-0 text-muted-foreground" />
                                <span className="min-w-0 truncate">{atleta.nome}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1">
                                <Badge variant="secondary">
                                    {atleta.numCamisa ? `camisa ${atleta.numCamisa}` : "sem camisa"}
                                </Badge>

                                <AtletaDialog
                                    idEquipe={idEquipe}
                                    idModalidadeDaEquipe={idModalidadeDaEquipe}
                                    atleta={atleta}
                                    aoSalvar={aoSalvarAtleta}
                                    gatilho={
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Editar ${atleta.nome}`}
                                            title="Editar atleta"
                                        >
                                            <Pencil />
                                        </Button>
                                    }
                                />

                                <Confirmacao
                                    gatilho={
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Tirar ${atleta.nome} do elenco`}
                                            title="Tirar do elenco"
                                        >
                                            <LogOut />
                                        </Button>
                                    }
                                    titulo={`Tirar ${atleta.nome} do elenco?`}
                                    // Diz o que NÃO acontece: sem isto a pessoa
                                    // hesita, achando que vai apagar o atleta.
                                    descricao={`O atleta continua cadastrado e pode entrar em outra equipe — só deixa de fazer parte de ${nomeDaEquipe}.`}
                                    rotuloDaAcao="Tirar do elenco"
                                    aoConfirmar={() => aoRemoverDoElenco(atleta)}
                                />

                                <Confirmacao
                                    gatilho={
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Excluir o cadastro de ${atleta.nome}`}
                                            title="Excluir o cadastro do atleta"
                                        >
                                            <Trash2 />
                                        </Button>
                                    }
                                    titulo={`Excluir o cadastro de ${atleta.nome}?`}
                                    descricao="Isto não é sair da equipe: o atleta deixa de existir no cadastro, com o histórico dele. Para só desfalcar o elenco, use “Tirar do elenco”."
                                    rotuloDaAcao="Excluir atleta"
                                    aoConfirmar={() => aoExcluirAtleta(atleta)}
                                />
                            </span>
                        </CardTitle>
                        <CardDescription>
                            {atleta.idade ? `${atleta.idade} anos` : "Idade não informada"}
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
};
