package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "SANCAO_JOGADOR")
public class SancaoJogador
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ID_SANCAO")
    private Sancao sancao;

    @Column(name = "EXCAO")
    private Boolean excao;

    @Column(name = "PARTIDAS_EXCECAO")
    private Integer partidasExcecao;

    @ManyToOne
    @JoinColumn(name = "ID_JOGADOR")
    private Jogadores jogador;

    @ManyToOne
    @JoinColumn(name = "ID_PARTIDA")
    private Partida partidaInicioSancao;

    @Column(name = "PARTIDAS_RESTANTES")
    private Integer partidasRestantes;

    @Column(name = "ATIVA")
    private Boolean ativo;

    @Column(name = "JUSTIFICATIVA")
    private String justificativa;


    public SancaoJogador ( Long id, Sancao sancao, Boolean excao, Integer partidasExcecao,
            Jogadores jogador, Partida partidaInicioSancao )
    {
        this.id = id;
        this.sancao = sancao;
        this.excao = excao;
        this.partidasExcecao = partidasExcecao;
        this.jogador = jogador;
        this.partidaInicioSancao = partidaInicioSancao;

        if ( excao )
        {
            this.partidasRestantes = partidasExcecao;
        } else
        {
            this.partidasRestantes = sancao.getQuantidadePartidasPadrao();
        }

        this.ativo = true;
    }

    public SancaoJogador ()
    {

    }
}
