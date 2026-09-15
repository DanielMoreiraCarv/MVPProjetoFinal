package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** O valor de um atributo numa instância de fase. */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "VALOR_ATRIBUTO_FASE")
public class ValorAtributoFase
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ID_FASE", nullable = false)
    private Fase fase;

    @ManyToOne
    @JoinColumn(name = "ID_ATRIBUTO", nullable = false)
    private AtributoFase atributo;

    @Column(name = "VALOR", length = 200)
    private String valor;

    public ValorAtributoFase ( Fase fase, AtributoFase atributo, String valor )
    {
        this.fase = fase;
        this.atributo = atributo;
        this.valor = valor;
    }
}
