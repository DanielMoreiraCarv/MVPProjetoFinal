package org.example.Fases;

/** Desempenho de um equipe dentro de uma fase, agregado a partir das partidas. */
public class Desempenho
{
    private final Long idEquipe;
    private int jogos;
    private int vitorias;
    private int empates;
    private int derrotas;
    private int golsPro;
    private int golsContra;
    private int pontos;

    public Desempenho ( Long idEquipe )
    {
        this.idEquipe = idEquipe;
    }

    public void registrar ( int golsFeitos, int golsSofridos, int pontosPorVitoria,
            int pontosPorEmpate, int pontosPorDerrota )
    {
        jogos++;
        golsPro += golsFeitos;
        golsContra += golsSofridos;

        if ( golsFeitos > golsSofridos )
        {
            vitorias++;
            pontos += pontosPorVitoria;
        }
        else if ( golsFeitos == golsSofridos )
        {
            empates++;
            pontos += pontosPorEmpate;
        }
        else
        {
            derrotas++;
            pontos += pontosPorDerrota;
        }
    }

    public Long getIdTime () { return idEquipe; }
    public int getJogos () { return jogos; }
    public int getVitorias () { return vitorias; }
    public int getEmpates () { return empates; }
    public int getDerrotas () { return derrotas; }
    public int getGolsPro () { return golsPro; }
    public int getGolsContra () { return golsContra; }
    public int getPontos () { return pontos; }
    public int getSaldoDeGols () { return golsPro - golsContra; }
}
