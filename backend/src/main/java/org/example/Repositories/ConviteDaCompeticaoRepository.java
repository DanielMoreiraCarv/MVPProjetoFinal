package org.example.Repositories;

import org.example.Models.ConviteDaCompeticao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConviteDaCompeticaoRepository extends JpaRepository<ConviteDaCompeticao, Long>
{
    List<ConviteDaCompeticao> findByIdCompeticaoOrderByCriadoEm(Long idCompeticao);

    Optional<ConviteDaCompeticao> findByIdCompeticaoAndEmail(Long idCompeticao, String email);

    /** E-mails são guardados em minúsculas, então a busca é exata e usa o índice. */
    List<ConviteDaCompeticao> findByEmail(String email);
}
