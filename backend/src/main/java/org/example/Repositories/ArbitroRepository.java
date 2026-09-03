package org.example.Repositories;

import org.example.Models.Arbitro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArbitroRepository extends JpaRepository<Arbitro, Long> {
    
    Optional<Arbitro> findByNome(String nome);
    
    List<Arbitro> findByFederacao(String federacao);
    
    List<Arbitro> findByCategoria(String categoria);
    
    List<Arbitro> findByFederacaoAndCategoria(String federacao, String categoria);
}
