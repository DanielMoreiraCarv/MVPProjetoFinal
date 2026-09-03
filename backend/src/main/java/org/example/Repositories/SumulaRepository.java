package org.example.Repositories;

import org.example.Models.Sumula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SumulaRepository extends JpaRepository<Sumula, Long> {
    
    List<Sumula> findByAssinadaTrue();
    
    List<Sumula> findByAssinadaFalse();
    
    Optional<Sumula> findByPartidaId(Long partidaId);
    
    List<Sumula> findByArbitroId(Long arbitroId);
}
