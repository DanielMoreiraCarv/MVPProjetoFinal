package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "equipe")
public class Equipe
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nome")
    private String nome;

    @ManyToMany
    @JoinTable(
            name = "equipe_atleta",
            joinColumns = @JoinColumn(name = "equipe_id"),
            inverseJoinColumns = @JoinColumn(name = "atleta_id")
    )
    private List<Atleta> lstAtletas;

    @ManyToOne
    @JoinColumn(name = "modalidade_id")
    private Modalidade modalidade;

    @ManyToOne
    @JoinColumn(name = "federacao_id")
    private Federacao federacao;

    public Equipe ()
    {
    }

    public Equipe ( Long id, String nome, List<Atleta> lstAtletas, Modalidade modalidade )
    {
        this.id = id;
        this.nome = nome;
        this.lstAtletas = lstAtletas;
        this.modalidade = modalidade;
    }

    public Long getIdModalidade ()
    {
        return modalidade == null ? null : modalidade.getId();
    }
}
