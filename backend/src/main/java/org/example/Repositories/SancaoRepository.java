package org.example.Repositories;

import org.example.Models.EnumTipoEsporte;
import org.example.Models.Sancao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SancaoRepository extends JpaRepository<Sancao, Long>
{

    @Query("""
               SELECT s
               FROM Sancao s
               WHERE s.campeonato.id = :campeonatoId
           """)
    List<Sancao> findAllByCompeticaoId ( Long campeonatoId );

    @Query("""
               SELECT COUNT(s)
               FROM Sancao s
               WHERE s.campeonato.id = :campeonatoId
                 AND s.enumTipoEsporte = :tipoEsporte
           """)
    Long countSancoesCompeticoesEEsporte (
            Long campeonatoId,
            EnumTipoEsporte tipoEsporte
    );

}
