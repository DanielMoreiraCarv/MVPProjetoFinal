package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "MODALIDADE")
public class Modalidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CODIGO", nullable = false, unique = true, length = 40)
    private String codigo;

    @Column(name = "NOME", nullable = false, length = 80)
    private String nome;

    @Column(name = "JOGADORES_EM_QUADRA", nullable = false)
    private int jogadoresEmQuadra;

    @Column(name = "ATIVO", nullable = false)
    private boolean ativo = true;

    public Modalidade ( String codigo, String nome, int jogadoresEmQuadra )
    {
        this.codigo = codigo;
        this.nome = nome;
        this.jogadoresEmQuadra = jogadoresEmQuadra;
    }
}
