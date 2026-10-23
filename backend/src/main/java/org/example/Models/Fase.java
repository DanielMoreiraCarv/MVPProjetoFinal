package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "fase")
public class Fase
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    //indica a ordem na fase na competição(ex: 1 -> primeira fase)
    @Column(name = "ordem")
    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_fase")
    private EnumFasePartida fasePartida;

    @ManyToOne
    @JoinColumn(name = "competicao_id")
    private Competicao competicao;

    @Column(name = "quantidade_classificados")
    private Integer quantidadeClassificados;

    @OneToOne
    @JoinColumn(name = "fase_sucessora_id")
    private Fase faseSucessora;
}
