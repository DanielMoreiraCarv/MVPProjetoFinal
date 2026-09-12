package org.example.Services;

import org.example.Models.SancaoJogador;
import org.example.Repositories.SancaoJogadorRespository;
import org.example.Repositories.SancaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SancaoJogadorService
{
    @Autowired
    private SancaoRepository sancaoRepository;

    @Autowired
    private SancaoJogadorRespository sancaoJogadorRespository;

    public SancaoJogador criarSancaoJogador ( SancaoJogador sancaoJogador )
    {
        return sancaoJogadorRespository.save( sancaoJogador );
    }

    public void deleteSancaoJogador ( Long id )
    {
        sancaoJogadorRespository.deleteById( id );
    }

    public List<SancaoJogador> findAll ()
    {
        return sancaoJogadorRespository.findAll();
    }

    public SancaoJogador findById ( Long id )
    {
        return sancaoJogadorRespository.findById( id ).orElse( null );
    }

    public SancaoJogador update ( SancaoJogador sancaoJogador )
    {
        return sancaoJogadorRespository.save( sancaoJogador );
    }
}
