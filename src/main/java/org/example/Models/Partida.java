package org.example.Models;

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
@Table(name = "PARTIDA")
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ID_TIME_MANDANTE")
    private Time timeMandante;

    @ManyToOne
    @JoinColumn(name = "ID_TIME_VISITANTE")
    private Time timeVisitante;

    @ManyToOne
    @JoinColumn(name = "ID_CAMPEONATO")
    private Campeonato campeonato;

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

    public Long getIdTimeMandante ()
    {
        return timeMandante == null ? null : timeMandante.getId();
    }

    public Long getIdTimeVisitante ()
    {
        return timeVisitante == null ? null : timeVisitante.getId();
    }

    public Long getIdCampeonato ()
    {
        return campeonato == null ? null : campeonato.getId();
    }

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
        Time mandante = new Time();
        mandante.setId( idTimeMandante );
        this.timeMandante = mandante;
        Time visitante = new Time();
        visitante.setId( idTimeVisitante );
        this.timeVisitante = visitante;
        Campeonato campeonato = new Campeonato();
        campeonato.setId( idCampeonato );
        this.campeonato = campeonato;
        this.idTabela = idTabela;
        this.idVencedor = idVencedor;
        this.resultadoVisitante = resultadoVisitante;
        this.resultadoMandante = resultadoMandante;
        this.realizada = false;
    }
}