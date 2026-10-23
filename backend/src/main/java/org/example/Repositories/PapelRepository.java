package org.example.Repositories;

import org.example.Models.Papel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PapelRepository extends JpaRepository<Papel, Long>
{
    Optional<Papel> findByCodigo(String codigo);
}
