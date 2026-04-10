package org.example.Models;

import java.util.List;

public class Time {
    private Long id;

    private String nome;

    private List<Jogadores> lstJogadores;

    private EnumTipoEsporte enumTipoEsporte;

    public Time(Long id, String nome, List<Jogadores> lstJogadores,EnumTipoEsporte enumTipoEsporte) {
        this.id = id;
        this.nome = nome;
        this.lstJogadores = lstJogadores;
        this.enumTipoEsporte = enumTipoEsporte;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public List<Jogadores> getLstJogadores() {
        return lstJogadores;
    }

    public void setLstJogadores(List<Jogadores> lstJogadores) {
        this.lstJogadores = lstJogadores;
    }

    public EnumTipoEsporte getEnumTipoEsporte() {
        return enumTipoEsporte;
    }

    public void setEnumTipoEsporte(EnumTipoEsporte enumTipoEsporte) {
        this.enumTipoEsporte = enumTipoEsporte;
    }
}
