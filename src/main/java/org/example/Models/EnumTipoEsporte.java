package org.example.Models;

public enum EnumTipoEsporte {

    FUTEBOL(1, "Futebol"),
    BASQUETE(2, "Basquete"),
    VOLEI(3, "Vôlei");


    private final int id;
    private final String descricao;

    EnumTipoEsporte(int id, String descricao) {
        this.id = id;
        this.descricao = descricao;
    }

    public int getId() {
        return id;
    }

    public String getDescricao() {
        return descricao;
    }

    public static EnumTipoEsporte fromId(int id) {
        for (EnumTipoEsporte tipo : values()) {
            if (tipo.id == id) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Id inválido: " + id);
    }
}
