package org.example.Repositories;

import org.example.Models.Federacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FederacaoRepository extends JpaRepository<Federacao, Long>
{
}
