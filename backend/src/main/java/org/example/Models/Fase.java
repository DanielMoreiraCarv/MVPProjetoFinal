package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "FASE")
public class Fase
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NOME")
    private String nome;

    //indica a ordem na fase na competição(ex: 1 -> primeira fase)
    @Column(name = "ORDEM")
    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_FASE")
    EnumFasePartida fasePartida;

    @ManyToOne
    @JoinColumn(name = "ID_CAMPEONATO")
    private Campeonato campeonato;

    @Column(name = "QUANTIDADE_CLASSIFICADOS")
    private Integer quantidadeClassificados;

    @OneToOne
    @JoinColumn(name = "ID_FASE_SUCESSORA")
    private Fase faseSucessora;
}
