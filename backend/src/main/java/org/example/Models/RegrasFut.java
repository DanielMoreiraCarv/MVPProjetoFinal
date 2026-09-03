package org.example.Models;

public class RegrasFut {
    
    public static final int JOGADORES_MINIMOS_CAMPO = 7;
    public static final int JOGADORES_MAXIMOS_CAMPO = 11;
    public static final int MAX_INSCRITOS_POR_TIME = 22;
    public static final int PONTOS_VITORIA = 3;
    public static final int PONTOS_EMPATE = 1;
    public static final int DURACAO_TEMPO_MINUTOS = 45;
    public static final int INTERVALO_MINUTOS = 15;
    public static final int MAX_SUBSTITUICOES = 5;
    public static final int CARTÕES_AMARELOS_PARA_SUSPENSAO = 3;
    public static final int PONTOS_DISCIPLINA_AMARELO = 1;
    public static final int PONTOS_DISCIPLINA_VERMELHO = 3;

    public boolean validarInicioPartida(int jogadoresPresentes) {
        return jogadoresPresentes >= JOGADORES_MINIMOS_CAMPO;
    }

    public String[] getCriteriosDesempate() {
        return new String[]{"Número de Vitórias", "Saldo de Gols", "Gols Pró", "Confronto Direto", "Menor número de cartões"};
    }
}