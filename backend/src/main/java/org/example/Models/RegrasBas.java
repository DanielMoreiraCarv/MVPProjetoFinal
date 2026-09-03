package org.example.Models;

public class RegrasBas {

    public static final int JOGADORES_EM_QUADRA = 5;
    public static final int MAX_JOGADORES_RELACIONADOS = 12;
    public static final int NUMERO_QUARTOS = 4;
    public static final int DURACAO_QUARTO_MINUTOS = 10;
    public static final int DURACAO_PRORROGACAO_MINUTOS = 5;
    public static final int LIMITE_FALTAS_INDIVIDUAL = 5;
    public static final int LIMITE_FALTAS_EQUIPE_QUARTO = 4;
    public static final int TEMPOS_TECNICOS_DISPONIVEIS = 5; 

    public int calcularValorCesta(int distanciaEmMetros) {
        if (distanciaEmMetros > 6.75) return 3;
        return 2;
    }

    public boolean verificarExclusaoJogador(int faltasCometidas) {
        return faltasCometidas >= LIMITE_FALTAS_INDIVIDUAL;
    }

    public boolean temLanceLivreBonus(int faltasEquipeNoQuarto) {
        return faltasEquipeNoQuarto > LIMITE_FALTAS_EQUIPE_QUARTO;
    }
}