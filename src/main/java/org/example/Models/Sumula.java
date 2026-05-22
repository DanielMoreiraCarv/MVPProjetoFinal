package org.example.Models;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "SUMULA")
public class Sumula {

    @Id
    private Long id;
    
    @OneToOne(mappedBy = "sumula", cascade = CascadeType.ALL)
    private Partida partida;
    
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ARBITRO_ID")
    private Arbitro arbitro;
    
    @Column(name = "GOLS_MANDANTE")
    private int golsMandante;
    
    @Column(name = "GOLS_VISITANTE")
    private int golsVisitante;
    
    @ElementCollection
    @CollectionTable(name = "SUMULA_OCORRENCIAS", joinColumns = @JoinColumn(name = "SUMULA_ID"))
    @Column(name = "OCORRENCIA")
    private List<String> ocorrencias; 
    
    @Column(name = "OBSERVACOES_RELATAS")
    private String observacoesRelatadas;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "DATA_FECHAMENTO")
    private Date dataFechamento;
    
    @Column(name = "ASSINADA")
    private boolean assinada;

    public Sumula() {
    }

    public Sumula(Long id, Partida partida, Arbitro arbitro) {
        this.id = id;
        this.partida = partida;
        this.arbitro = arbitro;
        this.ocorrencias = new ArrayList<>();
        this.golsMandante = 0;
        this.golsVisitante = 0;
        this.assinada = false;
        this.dataFechamento = new Date();
    }

    public void adicionarOcorrencia(String evento) {
        this.ocorrencias.add(evento);
    }

    public void finalizarSumula(int golsM, int golsV, String relato) {
        this.golsMandante = golsM;
        this.golsVisitante = golsV;
        this.observacoesRelatadas = relato;
        this.assinada = true;
        this.dataFechamento = new Date();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Partida getPartida() {
        return partida;
    }

    public void setPartida(Partida partida) {
        this.partida = partida;
    }

    public Arbitro getArbitro() {
        return arbitro;
    }

    public void setArbitro(Arbitro arbitro) {
        this.arbitro = arbitro;
    }

    public int getGolsMandante() {
        return golsMandante;
    }

    public void setGolsMandante(int golsMandante) {
        this.golsMandante = golsMandante;
    }

    public int getGolsVisitante() {
        return golsVisitante;
    }

    public void setGolsVisitante(int golsVisitante) {
        this.golsVisitante = golsVisitante;
    }

    public List<String> getOcorrencias() {
        return ocorrencias;
    }

    public void setOcorrencias(List<String> ocorrencias) {
        this.ocorrencias = ocorrencias;
    }

    public String getObservacoesRelatadas() {
        return observacoesRelatadas;
    }

    public void setObservacoesRelatadas(String observacoesRelatadas) {
        this.observacoesRelatadas = observacoesRelatadas;
    }

    public Date getDataFechamento() {
        return dataFechamento;
    }

    public void setDataFechamento(Date dataFechamento) {
        this.dataFechamento = dataFechamento;
    }

    public boolean isAssinada() {
        return assinada;
    }

    public void setAssinada(boolean assinada) {
        this.assinada = assinada;
    }
}