package org.example.Repositories;

import org.example.Models.ValorAtributoFase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValorAtributoFaseRepository extends JpaRepository<ValorAtributoFase, Long>
{
    List<ValorAtributoFase> findByFaseId(Long idFase);

    void deleteByFaseId(Long idFase);
}
