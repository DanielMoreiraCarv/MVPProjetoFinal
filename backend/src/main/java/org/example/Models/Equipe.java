package org.example.Models;

import jakarta.persistence.*;

import java.util.ArrayList;
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

    // O elenco é derivado de `atleta.equipe_id`, e não de uma associativa
    // própria: com as duas, `GET /equipe/{id}` e `GET /atleta?idEquipe=`
    // podiam responder coisas diferentes sobre quem está na equipe.
    @OneToMany(mappedBy = "equipe")
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

    /**
     * Mantém os dois lados do vínculo em memória.
     *
     * Só `atleta.setEquipe(equipe)` persiste — é ele que tem a coluna — mas a
     * coleção desta equipe, já carregada no mesmo contexto, continuaria sem o
     * atleta. Quem lesse a equipe logo depois de gravar receberia o elenco
     * antigo: foi isso que o teste das duas leituras acusou.
     */
    public void receberAtleta(Atleta atleta) {
        if (this.lstAtletas == null) {
            this.lstAtletas = new ArrayList<>();
        }
        if (this.lstAtletas.stream().noneMatch(a -> a.getId().equals(atleta.getId()))) {
            this.lstAtletas.add(atleta);
        }
        atleta.setEquipe(this);
    }

    public void dispensarAtleta(Atleta atleta) {
        if (this.lstAtletas != null) {
            this.lstAtletas.removeIf(a -> a.getId().equals(atleta.getId()));
        }
        atleta.setEquipe(null);
    }
}
