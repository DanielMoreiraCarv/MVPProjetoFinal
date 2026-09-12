package org.example.Repositories;

import org.example.Models.SancaoJogador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SancaoJogadorRespository extends JpaRepository<SancaoJogador, Long>
{
}
