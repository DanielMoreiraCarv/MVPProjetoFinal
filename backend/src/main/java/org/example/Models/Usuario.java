package org.example.Models;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Pessoa autenticável na plataforma. A senha não está aqui: só o hash BCrypt,
 * que nunca sai pela API.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "USUARIO")
public class Usuario
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NOME", nullable = false, length = 180)
    private String nome;

    @Column(name = "EMAIL", nullable = false, length = 180)
    private String email;

    @Column(name = "SENHA_HASH", nullable = false)
    private String senhaHash;

    @Column(name = "ATIVO", nullable = false)
    private boolean ativo = true;

    @Column(name = "CRIADO_EM", nullable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    @Column(name = "SENHA_ALTERADA_EM", nullable = false)
    private OffsetDateTime senhaAlteradaEm = OffsetDateTime.now();

    @Column(name = "TENTATIVAS_FALHAS", nullable = false)
    private int tentativasFalhas;

    @Column(name = "BLOQUEADO_ATE")
    private OffsetDateTime bloqueadoAte;

    // Ansioso: toda requisição autenticada precisa dos papéis para decidir o
    // acesso, e são poucos por usuário.
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<UsuarioPapel> papeis = new HashSet<>();

    public boolean bloqueado()
    {
        return bloqueadoAte != null && bloqueadoAte.isAfter(OffsetDateTime.now());
    }

    public void conceder(Papel papel, Administracao administracao)
    {
        papeis.add(new UsuarioPapel(this, papel, administracao));
    }

    public Set<String> codigosDosPapeis()
    {
        return papeis.stream()
                .map(concessao -> concessao.getPapel().getCodigo())
                .collect(Collectors.toSet());
    }
}
