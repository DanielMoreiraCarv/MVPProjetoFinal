package org.example.Repositories;

import org.example.Models.EnumFasePartida;
import org.example.Models.Partida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Long> {

    List<Partida> findByCampeonatoId(Long idCampeonato);

    List<Partida> findByRealizadaFalse();

    List<Partida> findByRealizadaTrue();

    List<Partida> findByTimeMandanteId(Long idTimeMandante);

    List<Partida> findByTimeVisitanteId(Long idTimeVisitante);

    List<Partida> findByIdVencedor(Long idVencedor);

    List<Partida> findByEnumFasePartida(EnumFasePartida enumFasePartida);

    List<Partida> findByIdTabela(Long idTabela);
}
