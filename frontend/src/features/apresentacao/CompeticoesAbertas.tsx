"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CarregandoCartoes, Vazio } from "@/src/components/estado/Estados";
import { Monograma } from "@/src/components/Monograma";
import { listarCompeticoesAbertas } from "@/src/lib/api/competicoes";
import { Competicao, ROTULO_DO_ESTADO } from "@/src/lib/types/competicao";
import { enderecoPublicoDaCompeticao } from "@/src/lib/visao-publica";

/** As competições que alguma organização abriu ao público — a vitrine da apresentação. */
export const CompeticoesAbertas = () => {
    const [abertas, setAbertas] = useState<Competicao[] | null>(null);
    const [falhou, setFalhou] = useState(false);

    useEffect(() => {
        listarCompeticoesAbertas()
            .then(setAbertas)
            .catch(() => setFalhou(true));
    }, []);

    if (falhou) {
        return (
            <Vazio
                conceito="competicao"
                titulo="Não foi possível listar agora"
                descricao="Quem recebeu um link de acompanhamento pode abri-lo direto."
            />
        );
    }

    if (!abertas) return <CarregandoCartoes cartoes={3} />;

    if (abertas.length === 0) {
        return (
            <Vazio
                conceito="competicao"
                titulo="Nenhuma competição aberta ao público agora"
                descricao="Quando uma organização abrir a dela, ela aparece aqui."
            />
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {abertas.map((competicao) => (
                <Link
                    key={competicao.id}
                    href={enderecoPublicoDaCompeticao(competicao.id)}
                    className="group block"
                >
                    <Card className="h-full transition-colors group-hover:border-ring">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Monograma nome={competicao.nome} />
                                <CardTitle className="min-w-0 flex-1 text-sm">{competicao.nome}</CardTitle>
                                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <CardDescription>
                                {[
                                    competicao.modalidade,
                                    competicao.estado && ROTULO_DO_ESTADO[competicao.estado],
                                    `${competicao.equipes.length} equipes`,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    );
};
