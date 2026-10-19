package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "evento_sumula")
public class EventoDaSumula
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sumula_id")
    private Sumula sumula;

    @ManyToOne(optional = false)
    @JoinColumn(name = "atleta_id")
    private Atleta atleta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private EnumTipoDeEvento tipo;

    @Column(name = "automatico", nullable = false)
    private boolean automatico;

    @Column(name = "registrado_em", nullable = false)
    private OffsetDateTime registradoEm;

    public EventoDaSumula ( Sumula sumula, Atleta atleta, Equipe equipe, EnumTipoDeEvento tipo,
            boolean automatico )
    {
        this.sumula = sumula;
        this.atleta = atleta;
        this.equipe = equipe;
        this.tipo = tipo;
        this.automatico = automatico;
        this.registradoEm = OffsetDateTime.now();
    }
}
