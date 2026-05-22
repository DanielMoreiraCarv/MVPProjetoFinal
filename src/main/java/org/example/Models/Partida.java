package org.example.Models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "PARTIDA")
public class Partida {

    @Id
    private Long id;

    @Column(name = "ID_TIME_MANDANTE")
    private Long idTimeMandante;

    @Column(name = "ID_TIME_VISITANTE")
    private Long idTimeVisitante;

    @Column(name = "ID_CAMPEONATO")
    private Long idCampeonato;

    @Column(name = "ID_TABELA")
    private Long idTabela;

    @Column(name = "ID_VENCEDOR")
    private Long idVencedor;

    @Column(name = "RESULTADO_VISITANTE")
    private int resultadoVisitante;

    @Column(name = "RESULTADO_MANDANTE")
    private int resultadoMandante;

    @Column(name = "REALIZADA")
    private boolean realizada;

    @Enumerated(EnumType.STRING)
    @Column(name = "ENUM_FASE_PARTIDA")
    private EnumFasePartida enumFasePartida;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ARBITRO_ID")
    private Arbitro arbitro;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "SUMULA_ID")
    private Sumula sumula;

    // CONSTRUTOR VAZIO
    public Partida () {
    }

    // CONSTRUTOR PRINCIPAL
    public Partida ( Long id,
            Long idTimeMandante,
            Long idTimeVisitante,
            Long idCampeonato,
            Long idTabela,
            Long idVencedor,
            int resultadoVisitante,
            int resultadoMandante )
    {

        this.id = id;
        this.idTimeMandante = idTimeMandante;
        this.idTimeVisitante = idTimeVisitante;
        this.idCampeonato = idCampeonato;
        this.idTabela = idTabela;
        this.idVencedor = idVencedor;
        this.resultadoVisitante = resultadoVisitante;
        this.resultadoMandante = resultadoMandante;
        this.realizada = false;
    }

    public Long getId () {
        return id;
    }

    public void setId ( Long id ) {
        this.id = id;
    }

    public Long getIdTimeMandante () {
        return idTimeMandante;
    }

    public void setIdTimeMandante ( Long idTimeMandante ) {
        this.idTimeMandante = idTimeMandante;
    }

    public Long getIdTimeVisitante () {
        return idTimeVisitante;
    }

    public void setIdTimeVisitante ( Long idTimeVisitante ) {
        this.idTimeVisitante = idTimeVisitante;
    }

    public Long getIdCampeonato () {
        return idCampeonato;
    }

    public void setIdCampeonato ( Long idCampeonato ) {
        this.idCampeonato = idCampeonato;
    }

    public Long getIdTabela () {
        return idTabela;
    }

    public void setIdTabela ( Long idTabela ) {
        this.idTabela = idTabela;
    }

    public Long getIdVencedor () {
        return idVencedor;
    }

    public void setIdVencedor ( Long idVencedor ) {
        this.idVencedor = idVencedor;
    }

    public int getResultadoVisitante () {
        return resultadoVisitante;
    }

    public void setResultadoVisitante ( int resultadoVisitante ) {
        this.resultadoVisitante = resultadoVisitante;
    }

    public int getResultadoMandante () {
        return resultadoMandante;
    }

    public void setResultadoMandante ( int resultadoMandante ) {
        this.resultadoMandante = resultadoMandante;
    }

    public boolean isRealizada () {
        return realizada;
    }

    public void setRealizada ( boolean realizada ) {
        this.realizada = realizada;
    }

    public EnumFasePartida getEnumFasePartida () {
        return enumFasePartida;
    }

    public void setEnumFasePartida ( EnumFasePartida enumFasePartida ) {
        this.enumFasePartida = enumFasePartida;
    }

    public Arbitro getArbitro () {
        return arbitro;
    }

    public void setArbitro ( Arbitro arbitro ) {
        this.arbitro = arbitro;
    }

    public Sumula getSumula () {
        return sumula;
    }

    public void setSumula ( Sumula sumula ) {
        this.sumula = sumula;
    }
}