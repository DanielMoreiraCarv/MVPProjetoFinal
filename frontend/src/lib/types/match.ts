import { z } from "zod";
import { competitionSchema } from "./competition";
import {competitionStageNamesSchema, competitionStageSchema} from "./competitionStage";


export const matchSchema = z.object({
    id: z.number(),
    homeTeam: z.string(),
    homeScore: z.number().optional(),
    awayTeam: z.string(),
    awayScore: z.number().optional(),
    winner: z.string().optional(),
    date: z.string(),
    tournament: z.string(),
    competitionName: z.string(),
    stageName: competitionStageNamesSchema,
    finished: z.boolean(),
});

export type Match = z.infer<typeof matchSchema>;
