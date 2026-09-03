import { z } from "zod";
import { playerSchema } from "./player";
import { sportSchema } from "./sport";


export const teamSchema = z.object({
    id: z.number(),
    name: z.string(),
    players: z.array(playerSchema),
    sport: sportSchema
});

export type Team = z.infer<typeof teamSchema>;
