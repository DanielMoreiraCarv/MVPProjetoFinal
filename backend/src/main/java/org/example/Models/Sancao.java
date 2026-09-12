package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "SANCAO")
public class Sancao
{
    //regra da sanção

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "QUANTIDADE_PARTIDAS_PADRAO")
    private Integer quantidadePartidasPadrao;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_ESPORTE")
    private EnumTipoEsporte enumTipoEsporte;

    @ManyToOne
    @JoinColumn(name = "ID_CAMPEONATO")
    private Campeonato campeonato;
}
