package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "TIME")
public class Time
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOME")
    private String nome;

    @ManyToMany
    @JoinTable(
            name = "TEAM_PLAYERS",
            joinColumns = @JoinColumn(name = "TEAM_ID"),
            inverseJoinColumns = @JoinColumn(name = "PLAYER_ID")
    )
    private List<Jogadores> lstJogadores;

    @ManyToOne
    @JoinColumn(name = "ID_MODALIDADE")
    private Modalidade modalidade;

    @ManyToOne
    @JoinColumn(name = "ID_FEDERACAO")
    private Federacao federacao;

    public Time ()
    {
    }

    public Time ( Long id, String nome, List<Jogadores> lstJogadores, Modalidade modalidade )
    {
        this.id = id;
        this.nome = nome;
        this.lstJogadores = lstJogadores;
        this.modalidade = modalidade;
    }

    public Long getIdModalidade ()
    {
        return modalidade == null ? null : modalidade.getId();
    }
}
