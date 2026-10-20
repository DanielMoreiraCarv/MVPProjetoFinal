package org.example.Repositories;

import org.example.Models.TokenRenovacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface TokenRenovacaoRepository extends JpaRepository<TokenRenovacao, Long>
{
    Optional<TokenRenovacao> findByTokenHash(String tokenHash);

    /** Encerra todas as sessões abertas do usuário. */
    @Modifying
    @Query("update TokenRenovacao t set t.revogadoEm = :agora "
            + "where t.usuario.id = :usuarioId and t.revogadoEm is null")
    int revogarTodosDoUsuario(@Param("usuarioId") Long usuarioId, @Param("agora") OffsetDateTime agora);
}
