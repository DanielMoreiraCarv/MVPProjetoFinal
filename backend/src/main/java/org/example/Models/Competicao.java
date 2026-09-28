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

    // Sem cascade: a equipe existe fora da competição e é compartilhada entre
    // competições. Com CascadeType.ALL, apagar uma competição apagaria as
    // equipes dela — e elas podem estar inscritas em outra.
    @ManyToMany
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

    /**
     * Inscreve a equipe. Recusar é lançar: antes isto imprimia no stdout e
     * retornava normalmente, então quem chamava achava que tinha dado certo e
     * a equipe simplesmente não estava lá.
     *
     * Inscrever duas vezes não é erro, é repetição de um pedido que já valeu
     * — não duplica e não reclama.
     */
    public void adicionarEquipe(Equipe equipe) {
        if (this.lstEquipes == null) {
            this.lstEquipes = new ArrayList<>();
        }

        if (!aceitaModalidade(equipe.getModalidade())) {
            throw new IllegalArgumentException(
                    "A equipe " + equipe.getNome() + " é de outra modalidade e não pode disputar "
                            + this.nome + ".");
        }

        boolean jaInscrita = this.lstEquipes.stream()
                .anyMatch(inscrita -> inscrita.getId().equals(equipe.getId()));

        if (!jaInscrita) {
            this.lstEquipes.add(equipe);
        }
    }

    /**
     * Remove pelo id, e não pelo objeto: `Equipe` não redefine `equals`, então
     * `List.remove(equipe)` compara por identidade e não acha a instância que
     * veio de outra consulta. Era esta a razão de remover não funcionar.
     *
     * Devolve se removeu, para a rota poder dizer que a equipe não estava
     * inscrita em vez de responder sucesso sem ter feito nada.
     */
    public boolean removerEquipe(Long idEquipe) {
        if (this.lstEquipes == null) {
            return false;
        }
        return this.lstEquipes.removeIf(inscrita -> inscrita.getId().equals(idEquipe));
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
