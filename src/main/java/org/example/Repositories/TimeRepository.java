package org.example.Repositories;

import org.example.Models.EnumTipoEsporte;
import org.example.Models.Time;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeRepository extends JpaRepository<Time, Long> {
    
    Optional<Time> findByNome(String nome);
    
    List<Time> findByEnumTipoEsporte(EnumTipoEsporte esporte);
}
