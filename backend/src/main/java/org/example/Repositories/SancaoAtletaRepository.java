package org.example.Repositories;

import org.example.Models.SancaoAtleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SancaoAtletaRepository extends JpaRepository<SancaoAtleta, Long>
{
}
