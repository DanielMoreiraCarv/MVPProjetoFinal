package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "JOGADORES")
public class Jogadores {

    @Id
    private Long id;

    @Column(name = "NOME")
    private String nome;

    @Column(name = "IDADE")
    private int idade;

    @Column(name = "EXPULSO")
    private Boolean expulso;

    @Column(name = "NUM_CAMISA")
    private int numCamisa;

    @Column(name = "POSICAO")
    private String posicao;

    @Column(name = "CPF")
    private String cpf;

    @Column(name = "GOLS")
    private int gols;

    @Column(name = "ASSISTENCIAS")
    private int assistencias;

    @Column(name = "CARTOES")
    private int cartoes;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_ESPORTE")
    private EnumTipoEsporte tipoEsporte;

    @Column(name = "PONTOS")
    private int pontos;

    @Column(name = "CESTAS")
    private int cestas;

    public Jogadores() {
    }

    public Jogadores(Long id, String nome, int idade, Boolean expulso, int numCamisa, String posicao, String cpf, EnumTipoEsporte tipoEsporte) {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.expulso = expulso;
        this.numCamisa = numCamisa;
        this.posicao = posicao;
        this.cpf = cpf;
        this.tipoEsporte = tipoEsporte;
        this.gols = 0;
        this.assistencias = 0;
        this.cartoes = 0;
        this.pontos = 0;
        this.cestas = 0;
    }

    public Jogadores ( long l, String diego, int i, boolean b ) {
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

    public int getNumCamisa() {
        return numCamisa;
    }

    public void setNumCamisa(int numCamisa) {
        this.numCamisa = numCamisa;
    }

    public String getPosicao() {
        return posicao;
    }

    public void setPosicao(String posicao) {
        this.posicao = posicao;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public int getGols() {
        return gols;
    }

    public void setGols(int gols) {
        this.gols = gols;
    }

    public int getAssistencias() {
        return assistencias;
    }

    public void setAssistencias(int assistencias) {
        this.assistencias = assistencias;
    }

    public int getCartoes() {
        return cartoes;
    }

    public void setCartoes(int cartoes) {
        this.cartoes = cartoes;
    }

    public EnumTipoEsporte getTipoEsporte() {
        return tipoEsporte;
    }

    public void setTipoEsporte(EnumTipoEsporte tipoEsporte) {
        this.tipoEsporte = tipoEsporte;
    }

    public int getPontos() {
        return pontos;
    }

    public void setPontos(int pontos) {
        this.pontos = pontos;
    }

    public int getCestas() {
        return cestas;
    }

    public void setCestas(int cestas) {
        this.cestas = cestas;
    }
}