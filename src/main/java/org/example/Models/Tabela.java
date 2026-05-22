package org.example.Models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;

@Entity
@Table(name = "TABELA")
public class Tabela {
    @Id
    private Long id;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "ID_TABELA")
    private List<Partida> partidas;

    @Column(name = "ID_CAMPEONATO")
    private Long idCampeonato;

    public Tabela() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Partida> getPartidas() {
        return partidas;
    }

    public void setPartidas(List<Partida> partidas) {
        this.partidas = partidas;
    }

    public Long getIdCampeonato() {
        return idCampeonato;
    }

    public void setIdCampeonato(Long idCampeonato) {
        this.idCampeonato = idCampeonato;
    }
}
