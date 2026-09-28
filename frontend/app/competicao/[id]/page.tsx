"use client";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { CompetitionDetail } from "@/src/features/campeonatos/competitionDetail";
import { useEscopo } from "@/src/lib/escopo";

// O conteúdo ainda é a tela antiga; a moldura e a trilha vêm do escopo, que
// já sabe em que competição e em que administração estamos.
const CompeticaoDetalhePage = () => {
    const { atual } = useEscopo();

    return (
        <>
            <CabecalhoDaPagina
                conceito="competicao"
                titulo={atual?.nome ?? "Competição"}
                descricao={
                    atual ? [atual.modalidade, atual.categoria].filter(Boolean).join(" · ") : undefined
                }
                migalhas={[
                    { rotulo: "Administrações", href: "/administracao" },
                    ...(atual ? [{ rotulo: atual.nomeDaAdministracao }] : []),
                    { rotulo: "Competições", href: "/competicao" },
                ]}
            />
            <CorpoDaPagina>
                <CompetitionDetail />
            </CorpoDaPagina>
        </>
    );
};

export default CompeticaoDetalhePage;
