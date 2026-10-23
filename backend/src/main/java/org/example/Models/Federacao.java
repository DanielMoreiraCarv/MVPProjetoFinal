package org.example.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@EntityListeners(DonoAutomatico.class)
@Getter
@Setter
@Table(name = "FEDERACAO")
@NoArgsConstructor
@AllArgsConstructor
public class Federacao implements TemDono
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "dono_id")
    private Long donoId;

    @Column(name = "NOME_FEDERACAO")
    private String nomeFederacao;


}
