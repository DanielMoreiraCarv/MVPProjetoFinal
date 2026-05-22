package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ARBITRO")
public class Arbitro {

    @Id
    private Long id;

    @Column(name = "NOME")
    private String nome;

    @Column(name = "FEDERACAO")
    private String federacao;

    @Column(name = "CATEGORIA")
    private String categoria;

    @Column(name = "PARTIDAS_APITADAS")
    private int partidasApitadas;

    public Arbitro() {
    }

    public Arbitro(Long id, String nome, String federacao, String categoria) {
        this.id = id;
        this.nome = nome;
        this.federacao = federacao;
        this.categoria = categoria;
        this.partidasApitadas = 0;
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

    public String getFederacao() {
        return federacao;
    }

    public void setFederacao(String federacao) {
        this.federacao = federacao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public int getPartidasApitadas() {
        return partidasApitadas;
    }

    public void setPartidasApitadas(int partidasApitadas) {
        this.partidasApitadas = partidasApitadas;
    }

    public void registrarTrabalho() {
        this.partidasApitadas++;
    }
}