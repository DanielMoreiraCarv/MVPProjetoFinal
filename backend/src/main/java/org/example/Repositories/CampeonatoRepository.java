package org.example.Repositories;

import org.example.Models.Campeonato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampeonatoRepository extends JpaRepository<Campeonato, Long> {
    
    Optional<Campeonato> findByNome(String nome);
    
    List<Campeonato> findByMataMata(boolean mataMata);
}
