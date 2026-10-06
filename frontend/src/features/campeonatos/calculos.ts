import { Partida } from "@/src/lib/types/partida";

export type LinhaDaClassificacao = {
    posicao: number;
    equipe: string;
    idEquipe?: number;
    jogos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    golsPro: number;
    golsContra: number;
    saldo: number;
    pontos: number;
};

/**
 * Classificação calculada no cliente.
 *
 * Isto é provisório e está registrado como tal: por RNF23 o cálculo precisa
 * viver só no servidor, derivado dos eventos da partida, e o front só exibir.
 * O backend já tem o motor de fases; falta a rota. Enquanto ela não existe,
 * a conta continua aqui — mas em um arquivo só, e não espalhada na tela, para
 * a remoção ser um `git rm`.
 *
 * Limites conhecidos: 3/1/0 fixo e desempate fixo em pontos → saldo → gols
 * feitos, quando RF26–RF28 pedem os dois configuráveis por competição.
 *
 * O chaveamento não está aqui porque não dá para calcular: a API devolve por
 * partida o FORMATO da fase (ELIMINATORIA), não o estágio (oitavas, quartas,
 * final). O que existia inferia o estágio partindo a lista ao meio, o que só
 * parecia funcionar porque o front rotulava toda eliminatória de "Final".
 */

export const calcularClassificacao = (
    partidas: Partida[],
    /** As inscritas entram zeradas: a tabela não espera o primeiro jogo para listá-las. */
    inscritas: string[] = [],
): LinhaDaClassificacao[] => {
    const desempenho = new Map<string, Omit<LinhaDaClassificacao, "posicao" | "equipe" | "jogos" | "saldo" | "pontos">>();
    const de = (equipe: string) => {
        if (!desempenho.has(equipe)) {
            desempenho.set(equipe, { vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0 });
        }
        return desempenho.get(equipe)!;
    };

    inscritas.forEach((equipe) => de(equipe));

    for (const partida of partidas) {
        if (!partida.realizada) continue;
        const mandante = de(partida.equipeMandante);
        const visitante = de(partida.equipeVisitante);
        const golsMandante = partida.placarMandante ?? 0;
        const golsVisitante = partida.placarVisitante ?? 0;

        mandante.golsPro += golsMandante;
        mandante.golsContra += golsVisitante;
        visitante.golsPro += golsVisitante;
        visitante.golsContra += golsMandante;

        if (golsMandante > golsVisitante) {
            mandante.vitorias++;
            visitante.derrotas++;
        } else if (golsMandante < golsVisitante) {
            visitante.vitorias++;
            mandante.derrotas++;
        } else {
            mandante.empates++;
            visitante.empates++;
        }
    }

    return [...desempenho.entries()]
        .map(([equipe, d]) => ({
            ...d,
            equipe,
            posicao: 0,
            jogos: d.vitorias + d.empates + d.derrotas,
            saldo: d.golsPro - d.golsContra,
            pontos: d.vitorias * 3 + d.empates,
        }))
        .sort(
            (a, b) =>
                b.pontos - a.pontos ||
                b.saldo - a.saldo ||
                b.golsPro - a.golsPro ||
                a.equipe.localeCompare(b.equipe, "pt-BR"),
        )
        .map((linha, i) => ({ ...linha, posicao: i + 1 }));
};
