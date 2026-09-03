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

    @ManyToMany
    @JoinTable(
            name = "CAMPEONATO_MODALIDADES",
            joinColumns = @JoinColumn(name = "CAMPEONATO_ID"),
            inverseJoinColumns = @JoinColumn(name = "MODALIDADE_ID")
    )
    private List<Modalidade> lstModalidades;

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

    public Campeonato(Long id, String nome, List<Modalidade> lstModalidades, List<Time> lstTimes, boolean mataMata) {
        this.id = id;
        this.nome = nome;
        this.lstModalidades = lstModalidades;
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

    public List<Modalidade> getLstModalidades() {
        return lstModalidades;
    }

    public void setLstModalidades(List<Modalidade> lstModalidades) {
        this.lstModalidades = lstModalidades;
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

        if (aceitaModalidade(time.getModalidade())) {
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

    public boolean aceitaModalidade(Modalidade modalidade) {
        if (modalidade == null || this.lstModalidades == null) {
            return false;
        }
        return this.lstModalidades.stream().anyMatch(m -> m.getId().equals(modalidade.getId()));
    }

    public List<Time> listarTimesPorModalidade(Long idModalidade) {
        if (this.lstTimes == null) {
            return new ArrayList<>();
        }
        return this.lstTimes.stream()
                            .filter(t -> idModalidade.equals(t.getIdModalidade()))
                            .toList();
    }
}
