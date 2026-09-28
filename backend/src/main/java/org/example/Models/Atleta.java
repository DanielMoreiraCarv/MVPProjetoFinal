package org.example.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "atleta")
public class Atleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "idade")
    private int idade;

    @Column(name = "expulso")
    private Boolean expulso;

    @Column(name = "num_camisa")
    private int numCamisa;

    @Column(name = "posicao")
    private String posicao;

    @Column(name = "cpf")
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "modalidade_id")
    private Modalidade modalidade;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;

    @Column(name = "gols")
    private int gols;

    @Column(name = "assistencias")
    private int assistencias;

    @Column(name = "cartoes")
    private int cartoes;

    @Column(name = "pontos")
    private int pontos;

    @Column(name = "cestas")
    private int cestas;

    public Atleta ( Long id, String nome, int idade, Boolean expulso, int numCamisa, String cpf )
    {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.expulso = expulso;
        this.numCamisa = numCamisa;
        this.cpf = cpf;
    }
}
