import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { AdministrationsList } from "@/src/features/administracoes/administatrionsList"
import { CompetitionsList } from "@/src/features/administracoes/competitionsList"
import { AdministracoesDuoGrid } from "@/src/features/administracoes/administracoesDuoGrid"

const TorneiosPage = () => {
    return (
        <AdministracoesDuoGrid/>
    )
};

export default TorneiosPage;