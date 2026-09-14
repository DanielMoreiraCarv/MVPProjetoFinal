package org.example.Repositories;

import org.example.Models.Fase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FaseRepository extends JpaRepository<Fase, Long>
{
    @Query("""
        SELECT f
        FROM Fase f
        WHERE f.campeonato.id = :campeonatoId
    """)
    Optional<List<Fase>> findFaseByCampeonatoId(@Param("campeonatoId") Long campeonatoId);
}
