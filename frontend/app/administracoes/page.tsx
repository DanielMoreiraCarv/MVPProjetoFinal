import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    mockMatches
} from "@/src/features/administracoes/mocks/matches"
import { mockCompetitions } from "@/src/features/administracoes/mocks/competitions"
import { mockTournaments } from "@/src/features/administracoes/mocks/tournaments"
import { AdministrationsList } from "@/src/features/administracoes/administatrionsList"
import { CompetitionsList } from "@/src/features/administracoes/competitionsList"
import { AdministracoesDuoGrid } from "@/src/features/administracoes/administracoesDuoGrid"

const TorneiosPage = () => {
    return (
        <AdministracoesDuoGrid/>
    )
};

export default TorneiosPage;