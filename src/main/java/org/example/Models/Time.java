package org.example.Models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;

@Entity
@Table(name = "TIME")
public class Time {
    @Id
    private Long id;

    @Column(name = "NOME")
    private String nome;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "TEAM_PLAYERS",
            joinColumns = @JoinColumn(name = "TEAM_ID"),
            inverseJoinColumns = @JoinColumn(name = "PLAYER_ID")
    )
    private List<Jogadores> lstJogadores;

    @Enumerated(EnumType.STRING)
    @Column(name = "ENUM_TIPO_ESPORTE")
    private EnumTipoEsporte enumTipoEsporte;

    public Time() {
    }

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
