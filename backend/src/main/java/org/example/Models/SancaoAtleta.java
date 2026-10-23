package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "sancao_atleta")
public class SancaoAtleta
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sancao_id")
    private Sancao sancao;

    @Column(name = "excecao")
    private Boolean excecao;

    @Column(name = "partidas_excecao")
    private Integer partidasExcecao;

    @ManyToOne
    @JoinColumn(name = "atleta_id")
    private Atleta atleta;

    @ManyToOne
    @JoinColumn(name = "partida_id")
    private Partida partidaInicioSancao;

    @Column(name = "partidas_restantes")
    private Integer partidasRestantes;

    @Column(name = "ativa")
    private Boolean ativo;

    @Column(name = "justificativa")
    private String justificativa;


    public SancaoAtleta ( Long id, Sancao sancao, Boolean excecao, Integer partidasExcecao,
            Atleta atleta, Partida partidaInicioSancao )
    {
        this.id = id;
        this.sancao = sancao;
        this.excecao = excecao;
        this.partidasExcecao = partidasExcecao;
        this.atleta = atleta;
        this.partidaInicioSancao = partidaInicioSancao;

        if ( excecao )
        {
            this.partidasRestantes = partidasExcecao;
        } else
        {
            this.partidasRestantes = sancao.getQuantidadePartidasPadrao();
        }

        this.ativo = true;
    }

    public SancaoAtleta ()
    {

    }
}
