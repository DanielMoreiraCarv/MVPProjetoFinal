"use client"

import { useState, useEffect, useCallback } from "react";
import { DuoGrid } from "@/src/components/DuoGrid";
import { AdministrationsList } from "@/src/features/administracoes/administatrionsList";
import { CompetitionsList } from "@/src/features/administracoes/competitionsList";
import { AddAdministrationDialog } from "@/src/features/administracoes/addAdministrationDialog";
import { AddCompetitionDialog } from "@/src/features/administracoes/addCompetitionDialog";
import { Tournaments } from "@/src/lib/types/tournaments";
import { Competition } from "@/src/lib/types/competition";
import { listarAdministracoes } from "@/src/lib/api/administracoes";

export const AdministracoesDuoGrid = () => {
    const [tournaments, setTournaments] = useState<Tournaments[]>([]);
    const [selecionada, setSelecionada] = useState<Tournaments | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const selecionar = (tournament: Tournaments) => {
        setSelecionada(tournament);
        setCompetitions(tournament.competitions);
    };

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            const administracoes = await listarAdministracoes();
            setTournaments(administracoes);
            setSelecionada(administracoes[0] ?? null);
            setCompetitions(administracoes[0]?.competitions ?? []);
        } catch (causa) {
            setErro(causa instanceof Error ? causa.message : "Não foi possível carregar as administrações.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const aoSalvar = (salva: Tournaments) => {
        setTournaments((atuais) => {
            const jaExiste = atuais.some((a) => a.id === salva.id);
            return jaExiste ? atuais.map((a) => (a.id === salva.id ? salva : a)) : [...atuais, salva];
        });
        setSelecionada(salva);
        setCompetitions(salva.competitions);
    };

    return (
        <DuoGrid
            left={{
                title: "Minhas Administrações",
                content: (
                    <div className="flex flex-col gap-3 flex-1">
                        <div className="flex gap-2">
                            <AddAdministrationDialog onSaved={aoSalvar} />
                            {selecionada && (
                                <AddAdministrationDialog
                                    key={selecionada.id}
                                    administracao={selecionada}
                                    onSaved={aoSalvar}
                                />
                            )}
                        </div>
                        {erro && (
                            <div role="alert" className="p-4 text-red-600 border border-red-300 rounded-md">
                                {erro}
                            </div>
                        )}
                        {carregando ? (
                            <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
                                Carregando administrações...
                            </div>
                        ) : (
                            <AdministrationsList tournaments={tournaments} callback={selecionar} />
                        )}
                    </div>
                )
            }}
            right={{
                title: "Campeonatos",
                content: (
                    <div className="flex flex-col gap-3 flex-1">
                        <AddCompetitionDialog />
                        <CompetitionsList competitions={competitions} />
                    </div>
                )
            }}
        />
    )
}
