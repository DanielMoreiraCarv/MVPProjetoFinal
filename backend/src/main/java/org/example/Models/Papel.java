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

/**
 * Perfil de autorização. O catálogo é carregado pela migração V12; os códigos
 * que o código consulta estão nas constantes abaixo.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "PAPEL")
public class Papel
{
    public static final String ADMINISTRADOR = "ADMINISTRADOR";
    public static final String ORGANIZADOR = "ORGANIZADOR";
    public static final String MESARIO = "MESARIO";
    public static final String ARBITRO = "ARBITRO";
    public static final String PUBLICO = "PUBLICO";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CODIGO", nullable = false, unique = true, length = 40)
    private String codigo;

    @Column(name = "DESCRICAO", nullable = false, length = 120)
    private String descricao;
}
