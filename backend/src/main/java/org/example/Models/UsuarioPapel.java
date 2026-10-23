package org.example.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Um papel concedido a um usuário, no escopo de uma administração — ou global,
 * quando a administração é nula.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "USUARIO_PAPEL")
public class UsuarioPapel
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "PAPEL_ID", nullable = false)
    private Papel papel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ADMINISTRACAO_ID")
    private Administracao administracao;

    public UsuarioPapel(Usuario usuario, Papel papel, Administracao administracao)
    {
        this.usuario = usuario;
        this.papel = papel;
        this.administracao = administracao;
    }
}
