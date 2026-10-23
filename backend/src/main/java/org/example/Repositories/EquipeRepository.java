package org.example.Repositories;

import org.example.Models.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Long> {

    Optional<Equipe> findByNome(String nome);

    List<Equipe> findByModalidadeId(Long idModalidade);

    long countByFederacaoId(Long idFederacao);
}
