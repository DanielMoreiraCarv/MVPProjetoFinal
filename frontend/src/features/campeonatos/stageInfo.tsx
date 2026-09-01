"use client"

import { CompetitionStageNames } from "@/src/lib/types/competitionStage";

const stageDescriptions: Record<CompetitionStageNames, string> = {
    "Pontos Corridos": "Todos os times se enfrentam em turno e returno. A classificação final é determinada por pontos acumulados.",
    "Grupo": "Os times são divididos em grupos e se enfrentam entre si. Os melhores de cada grupo avançam para a próxima fase.",
    "16 de finais": "Fase eliminatória com 32 times. Os vencedores avançam para as oitavas de final.",
    "Oitavas": "Fase eliminatória com 16 times. Os vencedores avançam para as quartas de final.",
    "Quartas": "Fase eliminatória com 8 times. Os vencedores avançam para as semifinais.",
    "Semi-finais": "Fase eliminatória com 4 times. Os vencedores avançam para a grande final.",
    "Final": "Jogo decisivo entre os dois finalistas. O vencedor é o campeão da competição.",
};

interface StageInfoProps {
    currentStage?: CompetitionStageNames;
}

export const StageInfo = ({ currentStage }: StageInfoProps) => {
    if (!currentStage) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-4 flex-1">
                Nenhuma fase definida para esta competição.
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg p-4 flex-1 flex flex-col gap-3">
            <h2 className="text-xl font-bold">{currentStage}</h2>
            <p className="text-sm text-gray-600">{stageDescriptions[currentStage]}</p>
        </div>
    );
};
