package org.example.Models;

public class Jogadores {

    private Long id;

    private String nome;

    private int idade;

    private Boolean expulso;

    public Jogadores(Long id, String nome, int idade, Boolean expulso) {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.expulso = expulso;
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

    public int getIdade() {
        return idade;
    }

    public void setIdade(int idade) {
        this.idade = idade;
    }

    public Boolean getExpulso() {
        return expulso;
    }

    public void setExpulso(Boolean expulso) {
        this.expulso = expulso;
    }
}
