import {z} from "zod"
import { teamSchema } from "./team"
import { sportSchema } from "./sport"


// mirrors Campeonato type in the backend
export const competitionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    sport: sportSchema.shape.name,
    modality: z.enum(['Masculino', 'Feminino']),
    teams: z.array(teamSchema),
})

export type Competition = z.infer<typeof competitionSchema>
