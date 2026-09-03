import {z} from "zod"
import { teamSchema } from "./team"
import { sportSchema } from "./sport"
import { competitionStageNamesSchema } from "./competitionStage"


// mirrors Campeonato type in the backend
export const competitionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    sport: sportSchema.shape.name,
    modality: z.enum(['Masculino', 'Feminino']),
    teams: z.array(teamSchema),
    currentStage: competitionStageNamesSchema.optional(),
})

export type Competition = z.infer<typeof competitionSchema>
