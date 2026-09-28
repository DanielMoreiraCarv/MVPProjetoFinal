package org.example.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "sancao")
public class Sancao
{
    //regra da sanção

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantidade_partidas_padrao")
    private Integer quantidadePartidasPadrao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_esporte")
    private EnumTipoEsporte enumTipoEsporte;

    @ManyToOne
    @JoinColumn(name = "competicao_id")
    private Competicao competicao;
}
