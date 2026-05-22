package org.example.Repositories;

import org.example.Models.EnumTipoEsporte;
import org.example.Models.Jogadores;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JogadoresRepository extends JpaRepository<Jogadores, Long> {
    
    Optional<Jogadores> findByNome(String nome);
    
    Optional<Jogadores> findByCpf(String cpf);
    
    List<Jogadores> findByTipoEsporte(EnumTipoEsporte tipoEsporte);
    
    List<Jogadores> findByExpulsoTrue();
    
    List<Jogadores> findByTipoEsporteAndExpulsoFalse(EnumTipoEsporte tipoEsporte);
}
