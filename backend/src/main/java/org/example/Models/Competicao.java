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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "competicao")
public class Competicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "administracao_id")
    private Administracao administracao;

    @Column(name = "nome")
    private String nome;

    @ManyToMany
    @JoinTable(
            name = "competicao_modalidade",
            joinColumns = @JoinColumn(name = "competicao_id"),
            inverseJoinColumns = @JoinColumn(name = "modalidade_id")
    )
    private List<Modalidade> lstModalidades;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "competicao_equipe",
            joinColumns = @JoinColumn(name = "competicao_id"),
            inverseJoinColumns = @JoinColumn(name = "equipe_id")
    )
    private List<Equipe> lstEquipes;

    @Column(name = "mata_mata")
    private boolean mataMata;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Column(name = "categoria", length = 20)
    private String categoria;

    public Competicao() {
    }

    public Competicao(boolean mataMata) {
        this.mataMata = mataMata;
    }

    public Competicao(Long id, String nome, List<Modalidade> lstModalidades, List<Equipe> lstEquipes, boolean mataMata) {
        this.id = id;
        this.nome = nome;
        this.lstModalidades = lstModalidades;
        this.lstEquipes = lstEquipes;
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

    public List<Equipe> getLstEquipes() {
        return lstEquipes;
    }

    public void setLstEquipes(List<Equipe> lstEquipes) {
        this.lstEquipes = lstEquipes;
    }

    public boolean isMataMata() {
        return mataMata;
    }

    public void setMataMata(boolean mataMata) {
        this.mataMata = mataMata;
    }

    public Administracao getAdministracao() {
        return administracao;
    }

    public void setAdministracao(Administracao administracao) {
        this.administracao = administracao;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void adicionarEquipe(Equipe equipe) {
        if (this.lstEquipes == null) {
            this.lstEquipes = new ArrayList<>();
        }

        if (aceitaModalidade(equipe.getModalidade())) {
            this.lstEquipes.add(equipe);
        } else {
            System.out.println("Essa equipe não pode participar dessa competição!");
        }
    }

    public void removerEquipe(Equipe equipe) {
        if (this.lstEquipes != null) {
            this.lstEquipes.remove(equipe);
        }
    }

    public boolean aceitaModalidade(Modalidade modalidade) {
        if (modalidade == null || this.lstModalidades == null) {
            return false;
        }
        return this.lstModalidades.stream().anyMatch(m -> m.getId().equals(modalidade.getId()));
    }

    public List<Equipe> listarEquipesPorModalidade(Long idModalidade) {
        if (this.lstEquipes == null) {
            return new ArrayList<>();
        }
        return this.lstEquipes.stream()
                            .filter(e -> idModalidade.equals(e.getIdModalidade()))
                            .toList();
    }
}
