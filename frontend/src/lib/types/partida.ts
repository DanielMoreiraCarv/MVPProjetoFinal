import { z } from "zod";


// O formato da fase, que é o que a API sabe dizer por partida hoje. O estágio
// da eliminatória — oitavas, quartas, final — depende da entidade Fase chegar
// na resposta da partida.
export const faseNomeSchema = z.enum(["Pontos corridos", "Fase de grupos", "Eliminatória"]);

export type FaseNome = z.infer<typeof faseNomeSchema>;

export const partidaSchema = z.object({
    id: z.number(),
    equipeMandante: z.string(),
    placarMandante: z.number().optional(),
    equipeVisitante: z.string(),
    placarVisitante: z.number().optional(),
    vencedor: z.string().optional(),
    nomeCompeticao: z.string(),
    idCompeticao: z.number(),
    realizada: z.boolean(),
    fase: z.string().optional(),
    arbitro: z.string().optional(),
});

export type Partida = z.infer<typeof partidaSchema>;
