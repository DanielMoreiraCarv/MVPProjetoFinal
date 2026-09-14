import {z} from "zod"
import { teamSchema } from "./team"
import { competitionStageNamesSchema } from "./competitionStage"


// espelha Campeonato no backend
export const competitionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    // nome da modalidade, vindo do catálogo do servidor
    sport: z.string(),
    modalidadeId: z.number().optional(),
    modality: z.string(),
    administracaoId: z.number().optional(),
    teams: z.array(teamSchema),
    currentStage: competitionStageNamesSchema.optional(),
})

export type Competition = z.infer<typeof competitionSchema>
