package org.example.Repositories;

import org.example.Models.Atleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtletaRepository extends JpaRepository<Atleta, Long> {
    
    Optional<Atleta> findByNome(String nome);
    
    Optional<Atleta> findByCpf(String cpf);
    
    List<Atleta> findByModalidadeId(Long idModalidade);

    List<Atleta> findByEquipeId(Long idEquipe);
    
    List<Atleta> findByExpulsoTrue();
    
    List<Atleta> findByModalidadeIdAndExpulsoFalse(Long idModalidade);
}
