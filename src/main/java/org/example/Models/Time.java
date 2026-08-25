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

    @Enumerated(EnumType.STRING)
    @Column(name = "ENUM_TIPO_ESPORTE")
    private EnumTipoEsporte enumTipoEsporte;

    @ManyToOne
    @JoinColumn(name = "ID_FEDERACAO")
    private Federacao federacao;

    public Time ()
    {
    }

    public Time ( Long id, String nome, List<Jogadores> lstJogadores,
            EnumTipoEsporte enumTipoEsporte )
    {
        this.id = id;
        this.nome = nome;
        this.lstJogadores = lstJogadores;
        this.enumTipoEsporte = enumTipoEsporte;
    }
}
