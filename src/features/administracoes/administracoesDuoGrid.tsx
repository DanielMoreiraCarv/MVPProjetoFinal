"use client"

import { useState, useEffect } from "react";
import { DuoGrid } from "@/src/components/DuoGrid";
import { AdministrationsList } from "@/src/features/administracoes/administatrionsList";
import { CompetitionsList } from "@/src/features/administracoes/competitionsList";
import { Tournaments } from "@/src/lib/types/tournaments";
import { Competition } from "@/src/lib/types/competition";
import { mockTournaments } from "@/src/features/administracoes/mocks/tournaments";

const getAdministrations = async () => {
    return mockTournaments;
}

export const AdministracoesDuoGrid = () => {
    const [tournaments, setTournaments] = useState<Tournaments[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);

    const getCompetitions = (tournament: Tournaments) => {
        setCompetitions(tournament.competitions);
    }

    useEffect(() => {
        const fetchData = async () => {
            const fetchedTournaments = await getAdministrations();
            let initialCompetitions: Competition[] = [];
            if (fetchedTournaments.length > 0) {
                initialCompetitions = fetchedTournaments[0].competitions;
            }

            setTournaments(fetchedTournaments);
            setCompetitions(initialCompetitions);
        };

        fetchData().catch(console.error);
    }, []);

    return (
        <DuoGrid
            left={<AdministrationsList tournaments={tournaments} callback={getCompetitions}/>}
            right={<CompetitionsList competitions={competitions}/>}
        />
    )
}
