package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "JOGADORES")
public class Jogadores {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @ManyToOne
    @JoinColumn(name = "ID_MODALIDADE")
    private Modalidade modalidade;

    @Column(name = "GOLS")
    private int gols;

    @Column(name = "ASSISTENCIAS")
    private int assistencias;

    @Column(name = "CARTOES")
    private int cartoes;

    @Column(name = "PONTOS")
    private int pontos;

    @Column(name = "CESTAS")
    private int cestas;

    public Jogadores ( Long id, String nome, int idade, Boolean expulso, int numCamisa, String cpf )
    {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.expulso = expulso;
        this.numCamisa = numCamisa;
        this.cpf = cpf;
    }
}
