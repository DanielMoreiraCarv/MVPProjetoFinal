package org.example.Repositories;

import org.example.Models.Modalidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModalidadeRepository extends JpaRepository<Modalidade, Long> {

    Optional<Modalidade> findByCodigo(String codigo);

    List<Modalidade> findByAtivoTrue();
}
