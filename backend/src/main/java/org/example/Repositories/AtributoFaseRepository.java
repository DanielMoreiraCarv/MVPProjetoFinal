package org.example.Repositories;

import org.example.Models.AtributoFase;
import org.example.Models.EnumFasePartida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtributoFaseRepository extends JpaRepository<AtributoFase, Long>
{
    List<AtributoFase> findByTipoFase(EnumFasePartida tipoFase);

    Optional<AtributoFase> findByTipoFaseAndCodigo(EnumFasePartida tipoFase, String codigo);
}
