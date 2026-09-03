package org.example.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "SUMULA")
public class Sumula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "PARTIDA_ID", unique = true)
    private Partida partida;

    @ManyToOne
    @JoinColumn(name = "ARBITRO_ID")
    private Arbitro arbitro;

    @Column(name = "GOLS_MANDANTE")
    private int golsMandante;

    @Column(name = "GOLS_VISITANTE")
    private int golsVisitante;

    @ElementCollection
    @CollectionTable(name = "SUMULA_OCORRENCIAS", joinColumns = @JoinColumn(name = "SUMULA_ID"))
    @Column(name = "OCORRENCIA")
    private List<String> ocorrencias = new ArrayList<>();

    @Column(name = "OBSERVACOES_RELATAS")
    private String observacoesRelatadas;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "DATA_FECHAMENTO")
    private Date dataFechamento;

    @Column(name = "ASSINADA")
    private boolean assinada;

    public Sumula ( Partida partida, Arbitro arbitro )
    {
        this.partida = partida;
        this.arbitro = arbitro;
    }

    public Long getIdPartida ()
    {
        return partida == null ? null : partida.getId();
    }

    public Long getIdArbitro ()
    {
        return arbitro == null ? null : arbitro.getId();
    }

    public void adicionarOcorrencia ( String ocorrencia )
    {
        this.ocorrencias.add( ocorrencia );
    }

    public void finalizarSumula ( int golsMandante, int golsVisitante, String relato )
    {
        this.golsMandante = golsMandante;
        this.golsVisitante = golsVisitante;
        this.observacoesRelatadas = relato;
        this.assinada = true;
        this.dataFechamento = new Date();
    }
}
