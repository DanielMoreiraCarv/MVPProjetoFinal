package org.example.Repositories;

import org.example.Models.Tabela;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TabelaRepository extends JpaRepository<Tabela, Long> {
    
    Optional<Tabela> findByIdCampeonato(Long idCampeonato);
    
    List<Tabela> findAll();
}
