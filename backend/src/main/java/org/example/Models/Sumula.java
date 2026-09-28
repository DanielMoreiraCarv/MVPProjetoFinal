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
@Table(name = "sumula")
public class Sumula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "partida_id", unique = true)
    private Partida partida;

    @ManyToOne
    @JoinColumn(name = "arbitro_id")
    private Arbitro arbitro;

    @Column(name = "placar_mandante")
    private int placarMandante;

    @Column(name = "placar_visitante")
    private int placarVisitante;

    @ElementCollection
    @CollectionTable(name = "sumula_ocorrencia", joinColumns = @JoinColumn(name = "sumula_id"))
    @Column(name = "ocorrencia")
    private List<String> ocorrencias = new ArrayList<>();

    @Column(name = "observacoes_relatadas")
    private String observacoesRelatadas;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "data_fechamento")
    private Date dataFechamento;

    @Column(name = "assinada")
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

    public void finalizarSumula ( int placarMandante, int placarVisitante, String relato )
    {
        this.placarMandante = placarMandante;
        this.placarVisitante = placarVisitante;
        this.observacoesRelatadas = relato;
        this.assinada = true;
        this.dataFechamento = new Date();
    }
}
