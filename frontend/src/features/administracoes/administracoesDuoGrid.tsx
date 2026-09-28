"use client"

import { useState, useEffect, useCallback } from "react";
import { DuoGrid } from "@/src/components/DuoGrid";
import { AdministrationsList } from "@/src/features/administracoes/administatrionsList";
import { CompetitionsList } from "@/src/features/administracoes/competitionsList";
import { AddAdministrationDialog } from "@/src/features/administracoes/addAdministrationDialog";
import { AddCompetitionDialog } from "@/src/features/administracoes/addCompetitionDialog";
import { Administracao } from "@/src/lib/types/administracao";
import { Competicao } from "@/src/lib/types/competicao";
import { listarAdministracoes } from "@/src/lib/api/administracoes";
import { listarCompeticoes } from "@/src/lib/api/competicoes";

export const AdministracoesDuoGrid = () => {
    const [tournaments, setTournaments] = useState<Administracao[]>([]);
    const [selecionada, setSelecionada] = useState<Administracao | null>(null);
    const [competitions, setCompetitions] = useState<Competicao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregarCompeticoes = useCallback(async (idAdministracao: number) => {
        try {
            setCompetitions(await listarCompeticoes(idAdministracao));
        } catch (causa) {
            setErro(causa instanceof Error ? causa.message : "Não foi possível carregar as competições.");
        }
    }, []);

    const selecionar = (administracao: Administracao) => {
        setSelecionada(administracao);
        carregarCompeticoes(administracao.id);
    };

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            const administracoes = await listarAdministracoes();
            setTournaments(administracoes);
            setSelecionada(administracoes[0] ?? null);

            if (administracoes[0]) {
                await carregarCompeticoes(administracoes[0].id);
            } else {
                setCompetitions([]);
            }
        } catch (causa) {
            setErro(causa instanceof Error ? causa.message : "Não foi possível carregar as administrações.");
        } finally {
            setCarregando(false);
        }
    }, [carregarCompeticoes]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const aoSalvar = (salva: Administracao) => {
        setTournaments((atuais) => {
            const jaExiste = atuais.some((a) => a.id === salva.id);
            return jaExiste ? atuais.map((a) => (a.id === salva.id ? salva : a)) : [...atuais, salva];
        });
        setSelecionada(salva);
        carregarCompeticoes(salva.id);
    };

    const aoSalvarCompeticao = (salva: Competicao) => {
        setCompetitions((atuais) => {
            const jaExiste = atuais.some((c) => c.id === salva.id);
            return jaExiste ? atuais.map((c) => (c.id === salva.id ? salva : c)) : [...atuais, salva];
        });
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
                            <div role="alert" className="p-4 text-destructive border border-destructive/40 rounded-md">
                                {erro}
                            </div>
                        )}
                        {carregando ? (
                            <div className="bg-card shadow-sm rounded-lg p-4 flex-1">
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
                        <AddCompetitionDialog
                            idAdministracao={selecionada?.id}
                            onSaved={aoSalvarCompeticao}
                        />
                        <CompetitionsList competitions={competitions} />
                    </div>
                )
            }}
        />
    )
}
