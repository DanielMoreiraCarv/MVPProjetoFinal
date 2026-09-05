package org.example.Repositories;

import org.example.Models.Federacao;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FederacaoRepository
{
    Optional<Federacao> buscarPorId ( Long id );
}
