package org.example.Repositories;

import org.example.Models.Competicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompeticaoRepository extends JpaRepository<Competicao, Long> {

    Optional<Competicao> findByNome(String nome);

    List<Competicao> findByMataMata(boolean mataMata);

    List<Competicao> findByAdministracaoId(Long idAdministracao);
}
