package org.example.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@EntityListeners(DonoAutomatico.class)
@Getter
@Setter
@NoArgsConstructor
@Table(name = "ADMINISTRACAO")
public class Administracao implements TemDono {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dono_id")
    private Long donoId;

    @Column(name = "NOME", nullable = false, length = 180)
    private String nome;

    @Column(name = "DESCRICAO", length = 500)
    private String descricao;
}
