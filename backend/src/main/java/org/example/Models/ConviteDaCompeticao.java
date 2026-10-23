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

import java.time.OffsetDateTime;

/** Convite para quem ainda não tem conta; vira participação no cadastro. */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "competicao_convite")
public class ConviteDaCompeticao
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "competicao_id", nullable = false)
    private Long idCompeticao;

    @Column(name = "email", nullable = false, length = 180)
    private String email;

    @Column(name = "convidado_por")
    private Long convidadoPor;

    @Column(name = "criado_em", nullable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();
}
