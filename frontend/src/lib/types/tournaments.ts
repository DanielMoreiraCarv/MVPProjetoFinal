import { z } from "zod";
import { competitionSchema } from "./competition";

export const tournamentsSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    competitions: z.array(competitionSchema)
});

export type Tournaments = z.infer<typeof tournamentsSchema>;
