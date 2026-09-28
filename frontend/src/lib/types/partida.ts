import { z } from "zod";

// O formato da fase, que é o que a API sabe dizer por partida hoje. O estágio
// da eliminatória — oitavas, quartas, final — depende da entidade Fase chegar
// na resposta da partida.
export const faseNomeSchema = z.enum(["Pontos corridos", "Fase de grupos", "Eliminatória"]);

export type FaseNome = z.infer<typeof faseNomeSchema>;

export const partidaSchema = z.object({
    id: z.number(),
    equipeMandante: z.string(),
    idEquipeMandante: z.number().optional(),
    placarMandante: z.number().optional(),
    equipeVisitante: z.string(),
    idEquipeVisitante: z.number().optional(),
    placarVisitante: z.number().optional(),
    vencedor: z.string().optional(),
    nomeCompeticao: z.string(),
    idCompeticao: z.number(),
    realizada: z.boolean(),
    fase: z.string().optional(),
    arbitro: z.string().optional(),
    /** ISO-8601 com fuso. Ausente enquanto a partida não foi agendada. */
    dataHora: z.string().optional(),
    local: z.string().optional(),
});

export type Partida = z.infer<typeof partidaSchema>;
