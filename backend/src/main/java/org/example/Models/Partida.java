package org.example.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "partida")
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipe_mandante_id")
    private Equipe equipeMandante;

    @ManyToOne
    @JoinColumn(name = "equipe_visitante_id")
    private Equipe equipeVisitante;

    @ManyToOne
    @JoinColumn(name = "competicao_id")
    private Competicao competicao;

    @ManyToOne
    @JoinColumn(name = "fase_id")
    private Fase fase;

    // Metadados que a fase grava ao gerar o confronto.
    @Column(name = "grupo")
    private Integer grupo;

    @Column(name = "rodada")
    private Integer rodada;

    @Column(name = "tabela_id")
    private Long idTabela;

    @Column(name = "equipe_vencedora_id")
    private Long idEquipeVencedora;

    @Column(name = "placar_visitante")
    private int placarVisitante;

    @Column(name = "placar_mandante")
    private int placarMandante;

    @Column(name = "realizada")
    private boolean realizada;

    @Enumerated(EnumType.STRING)
    @Column(name = "enum_fase_partida")
    private EnumFasePartida enumFasePartida;

    @ManyToOne
    @JoinColumn(name = "arbitro_id")
    private Arbitro arbitro;

    @JsonIgnore
    @OneToOne(mappedBy = "partida", cascade = CascadeType.ALL, orphanRemoval = true)
    private Sumula sumula;

    public Long getIdEquipeMandante ()
    {
        return equipeMandante == null ? null : equipeMandante.getId();
    }

    public Long getIdEquipeVisitante ()
    {
        return equipeVisitante == null ? null : equipeVisitante.getId();
    }

    public Long getIdCompeticao ()
    {
        return competicao == null ? null : competicao.getId();
    }

    public Long getIdFase ()
    {
        return fase == null ? null : fase.getId();
    }

    public Long getIdSumula ()
    {
        return sumula == null ? null : sumula.getId();
    }

    public void vincularSumula ( Sumula sumula )
    {
        this.sumula = sumula;
        if ( sumula != null )
        {
            sumula.setPartida( this );
        }
    }

    // CONSTRUTOR VAZIO
    public Partida () {
    }

    // CONSTRUTOR PRINCIPAL
    public Partida ( Long id,
            Long idEquipeMandante,
            Long idEquipeVisitante,
            Long idCompeticao,
            Long idTabela,
            Long idEquipeVencedora,
            int placarVisitante,
            int placarMandante )
    {

        this.id = id;
        Equipe mandante = new Equipe();
        mandante.setId( idEquipeMandante );
        this.equipeMandante = mandante;
        Equipe visitante = new Equipe();
        visitante.setId( idEquipeVisitante );
        this.equipeVisitante = visitante;
        Competicao competicao = new Competicao();
        competicao.setId( idCompeticao );
        this.competicao = competicao;
        this.idTabela = idTabela;
        this.idEquipeVencedora = idEquipeVencedora;
        this.placarVisitante = placarVisitante;
        this.placarMandante = placarMandante;
        this.realizada = false;
    }
}