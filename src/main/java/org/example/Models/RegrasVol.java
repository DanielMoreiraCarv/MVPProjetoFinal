package org.example.Models;

public class RegrasVol {

    public static final int JOGADORES_EM_QUADRA = 6;
    public static final int MAX_SUBSTITUICOES_POR_SET = 6;
    public static final int TEMPOS_DESCANSO_POR_SET = 2;
    public static final int PONTOS_SET_REGULAR = 25;
    public static final int PONTOS_SET_DESEMPATE = 15;
    public static final int DIFERENCA_MINIMA_PONTOS = 2;

    public int[] distribuirPontosTabela(int setsVencidos, int setsPerdidos) {
        if (setsVencidos == 3) {
            if (setsPerdidos <= 1) return new int[]{3, 0};
            return new int[]{2, 1};
        }
        return new int[]{0, 0};
    }

    public boolean validarSubstituicao(int substituiçõesRealizadas) {
        return substituiçõesRealizadas < MAX_SUBSTITUICOES_POR_SET;
    }

    public boolean verificarVitoriaSet(int pontosA, int pontosB, boolean ehTieBreak) {
        int alvo = ehTieBreak ? PONTOS_SET_DESEMPATE : PONTOS_SET_REGULAR;
        boolean atingiuAlvo = (pontosA >= alvo || pontosB >= alvo);
        boolean diferencaDois = Math.abs(pontosA - pontosB) >= DIFERENCA_MINIMA_PONTOS;
        
        return atingiuAlvo && diferencaDois;
    }
}