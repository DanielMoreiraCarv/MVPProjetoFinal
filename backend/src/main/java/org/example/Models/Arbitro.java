package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@EntityListeners(DonoAutomatico.class)
@Getter
@Setter
@Table(name = "ARBITRO")
public class Arbitro implements TemDono
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dono_id")
    private Long donoId;

    @Column(name = "nome")
    private String nome;

    @Column(name = "FEDERACAO")
    private String federacao;

    @Column(name = "CATEGORIA")
    private String categoria;

    @Column(name = "PARTIDAS_APITADAS")
    private int partidasApitadas;

    public Arbitro ()
    {
    }

    public Arbitro ( Long id, String nome, String federacao, String categoria )
    {
        this.id = id;
        this.nome = nome;
        this.federacao = federacao;
        this.categoria = categoria;
        this.partidasApitadas = 0;
    }


    public void registrarTrabalho ()
    {
        this.partidasApitadas++;
    }
}