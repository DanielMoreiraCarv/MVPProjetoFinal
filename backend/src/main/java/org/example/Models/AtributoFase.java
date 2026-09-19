package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Atributo que um tipo de fase aceita — por exemplo idaEVolta na fase de
 * grupos. Declarar os atributos em tabela permite que cada tipo tenha os seus
 * sem que a tabela de fase ganhe colunas que só um tipo usa.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "ATRIBUTO_FASE")
public class AtributoFase
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_FASE", nullable = false, length = 40)
    private EnumFasePartida tipoFase;

    @Column(name = "CODIGO", nullable = false, length = 60)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_DADO", nullable = false, length = 20)
    private EnumTipoDeDado tipoDado;

    @Column(name = "OBRIGATORIO", nullable = false)
    private boolean obrigatorio;

    @Column(name = "VALOR_PADRAO", length = 200)
    private String valorPadrao;

    @Column(name = "DESCRICAO", length = 300)
    private String descricao;

    public AtributoFase ( EnumFasePartida tipoFase, String codigo, EnumTipoDeDado tipoDado,
            boolean obrigatorio, String valorPadrao, String descricao )
    {
        this.tipoFase = tipoFase;
        this.codigo = codigo;
        this.tipoDado = tipoDado;
        this.obrigatorio = obrigatorio;
        this.valorPadrao = valorPadrao;
        this.descricao = descricao;
    }
}
