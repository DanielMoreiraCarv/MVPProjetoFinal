package org.example.Repositories;

import org.example.Models.Administracao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministracaoRepository extends JpaRepository<Administracao, Long> {
}
