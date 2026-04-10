package org.example.Models;

public enum EnumFasePartida {
    PONTOS_CORRIDOS(1, "Pontos Corridos"),
    GRUPOS(2, "Grupo"),
    DEZESSEIS_AVOS_DE_FINAIS(3, "16 de finais"),
    OITAVAS(4, "Oitavas"),
    QUARTAS(5,"Quartas"),
    SEMIS(6,"Semi-Finais"),
    FINAL(7,"Final");

    private final int id;
    private final String descricao;

    EnumFasePartida(int id, String descricao) {
        this.id = id;
        this.descricao = descricao;
    }

    public int getId() {
        return id;
    }

    public String getDescricao() {
        return descricao;
    }

    public static EnumFasePartida fromId(int id) {
        for (EnumFasePartida tipo : values()) {
            if (tipo.id == id) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Id inválido: " + id);
    }
}
