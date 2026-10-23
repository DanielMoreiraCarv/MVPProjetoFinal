package org.example.Repositories;

import org.example.Models.EnumFasePartida;
import org.example.Models.Partida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Long> {

    List<Partida> findByCompeticaoId(Long idCompeticao);

    List<Partida> findByRealizadaFalse();

    List<Partida> findByRealizadaTrue();

    List<Partida> findByEquipeMandanteId(Long idEquipeMandante);

    List<Partida> findByEquipeVisitanteId(Long idEquipeVisitante);

    List<Partida> findByIdEquipeVencedora(Long idEquipeVencedora);

    List<Partida> findByEnumFasePartida(EnumFasePartida enumFasePartida);

    List<Partida> findByIdTabela(Long idTabela);

    List<Partida> findByFaseId(Long idFase);
}
