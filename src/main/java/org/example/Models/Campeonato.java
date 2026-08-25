package org.example.Models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CAMPEONATO")
public class Campeonato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NOME")
    private String nome;

    @ElementCollection(targetClass = EnumTipoEsporte.class)
    @CollectionTable(name = "CAMPEONATO_ESPORTES", joinColumns = @JoinColumn(name = "CAMPEONATO_ID"))
    @Enumerated(EnumType.STRING)
    @Column(name = "ESPORTE")
    private List<EnumTipoEsporte> lstEnumTipoEsporte;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "CAMPEONATO_TIMES",
            joinColumns = @JoinColumn(name = "CAMPEONATO_ID"),
            inverseJoinColumns = @JoinColumn(name = "TEAM_ID")
    )
    private List<Time> lstTimes;

    @Column(name = "MATA_MATA")
    private boolean mataMata;

    public Campeonato() {
    }

    public Campeonato(boolean mataMata) {
        this.mataMata = mataMata;
    }

    public Campeonato(Long id, String nome, List<EnumTipoEsporte> lstEnumTipoEsporte, List<Time> lstTimes, boolean mataMata) {
        this.id = id;
        this.nome = nome;
        this.lstEnumTipoEsporte = lstEnumTipoEsporte;
        this.lstTimes = lstTimes;
        this.mataMata = mataMata;
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

    public List<EnumTipoEsporte> getEnumTipoEsporte() {
        return lstEnumTipoEsporte;
    }

    public void setEnumTipoEsporte(List<EnumTipoEsporte> lstEnumTipoEsporte) {
        this.lstEnumTipoEsporte = lstEnumTipoEsporte;
    }

    public List<Time> getLstTimes() {
        return lstTimes;
    }

    public void setLstTimes(List<Time> lstTimes) {
        this.lstTimes = lstTimes;
    }

    public boolean isMataMata() {
        return mataMata;
    }

    public void setMataMata(boolean mataMata) {
        this.mataMata = mataMata;
    }

    public void adicionarTime(Time time) {
        if (this.lstTimes == null) {
            this.lstTimes = new ArrayList<>();
        }

        if (this.lstEnumTipoEsporte != null && this.lstEnumTipoEsporte.contains(time.getEnumTipoEsporte())) {
            this.lstTimes.add(time);
        } else {
            System.out.println("Esse time não pode participar desse campeonato!");
        }
    }

    public void removerTime(Time time) {
        if (this.lstTimes != null) {
            this.lstTimes.remove(time);
        }
    }

    public List<Time> listarTimesPorEsporte(EnumTipoEsporte enumTipoEsporte){
        List<Time> lstTimeEspote = new ArrayList<>();
        lstTimeEspote.addAll(this.lstTimes.stream().filter(p -> p.getEnumTipoEsporte()==enumTipoEsporte).toList());
        return lstTimeEspote;
    }
}
