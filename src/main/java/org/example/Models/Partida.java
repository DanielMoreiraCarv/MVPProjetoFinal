package org.example.Models;

public class Partida {

    private Long id;

    private Long idTimeMandante;

    private Long idTimeVisitante;

    private Long idCampeonato;

    private Long idTabela;

    private Long idVencedor;

    private int resultadoVisitante;

    private int resultadoMandante;

    private EnumFasePartida enumFasePartida;

    public Partida(Long id, Long idTimeMandante, Long idTimeVisitante, Long idCampeonato,
                   Long idTabela, Long idVencedor, int resultadoVisitante,
                   int resultadoMandante) {
        this.id = id;
        this.idTimeMandante = idTimeMandante;
        this.idTimeVisitante = idTimeVisitante;
        this.idCampeonato = idCampeonato;
        this.idTabela = idTabela;
        this.idVencedor = idVencedor;
        this.resultadoVisitante = resultadoVisitante;
        this.resultadoMandante = resultadoMandante;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdTimeMandante() {
        return idTimeMandante;
    }

    public void setIdTimeMandante(Long idTimeMandante) {
        this.idTimeMandante = idTimeMandante;
    }

    public Long getIdTimeVisitante() {
        return idTimeVisitante;
    }

    public void setIdTimeVisitante(Long idTimeVisitante) {
        this.idTimeVisitante = idTimeVisitante;
    }

    public Long getIdCampeonato() {
        return idCampeonato;
    }

    public void setIdCampeonato(Long idCampeonato) {
        this.idCampeonato = idCampeonato;
    }

    public Long getIdTabela() {
        return idTabela;
    }

    public void setIdTabela(Long idTabela) {
        this.idTabela = idTabela;
    }

    public Long getIdVencedor() {
        return idVencedor;
    }

    public void setIdVencedor(Long idVencedor) {
        this.idVencedor = idVencedor;
    }

    public int getResultadoVisitante() {
        return resultadoVisitante;
    }

    public void setResultadoVisitante(int resultadoVisitante) {
        this.resultadoVisitante = resultadoVisitante;
    }

    public int getResultadoMandante() {
        return resultadoMandante;
    }

    public void setResultadoMandante(int resultadoMandante) {
        this.resultadoMandante = resultadoMandante;
    }
}
