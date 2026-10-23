package org.example.Models;

import jakarta.persistence.Column;
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

import java.time.OffsetDateTime;

/**
 * Uma sessão aberta. Guarda só o hash do token entregue ao cliente: quem lê
 * a tabela não consegue se passar pelo usuário.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "TOKEN_RENOVACAO")
public class TokenRenovacao
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    @Column(name = "TOKEN_HASH", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "CRIADO_EM", nullable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    @Column(name = "EXPIRA_EM", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "REVOGADO_EM")
    private OffsetDateTime revogadoEm;

    public boolean valido()
    {
        return revogadoEm == null && expiraEm.isAfter(OffsetDateTime.now());
    }
}
