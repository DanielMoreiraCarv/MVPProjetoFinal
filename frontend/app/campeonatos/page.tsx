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


const TorneiosPage = () => {
    return (
        <div className="p-8 flex-1 flex flex-col text-black">
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4"> Campeonatos </h1>
                    <div className="border border-gray-300 p-4 rounded-md flex-1">
                        <div className="flex flex-col gap-0.75">
                            {
                                mockCompetitions.map((competition) => (
                                    <Card key={competition.id}>
                                        <CardHeader>
                                            <CardTitle>
                                                {competition.name}
                                            </CardTitle>
                                            <CardDescription className="whitespace-pre-wrap">
                                                {competition.description}
                                                {"\n"}
                                                {competition.sport} - {competition.modality}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className="col-span-1 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">Próximos Jogos</h1>
                    <div className="border border-gray-300 p-4 rounded-md flex-1">
                        <div className="flex flex-col gap-0.75">
                            {mockMatches.map((match) => (
                                <Card key={match.id}>
                                    <CardHeader>
                                        <CardTitle>
                                            {match.homeTeam} vs {match.awayTeam}
                                        </CardTitle>
                                        <CardDescription>
                                            {match.tournament} - {match.competitionName}
                                        </CardDescription>
                                        <CardDescription>
                                            {match.date} - {match.stageName}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default TorneiosPage;