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

    /**
     * Encerra todas as sessões abertas do usuário. Limpa o contexto de
     * persistência: sem isso, um token já carregado na mesma transação
     * continuaria parecendo ativo depois do update em massa.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update TokenRenovacao t set t.revogadoEm = :agora "
            + "where t.usuario.id = :usuarioId and t.revogadoEm is null")
    int revogarTodosDoUsuario(@Param("usuarioId") Long usuarioId, @Param("agora") OffsetDateTime agora);

    /**
     * Revoga só se ainda estiver ativo, num update só: duas renovações
     * simultâneas com o mesmo token leem "ativo" ao mesmo tempo, e sem a
     * condição as duas sairiam com uma sessão nova. Devolve quantas linhas
     * mudou — zero é quem perdeu a corrida.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update TokenRenovacao t set t.revogadoEm = :agora "
            + "where t.id = :id and t.revogadoEm is null")
    int revogarSeAtivo(@Param("id") Long id, @Param("agora") OffsetDateTime agora);
}
