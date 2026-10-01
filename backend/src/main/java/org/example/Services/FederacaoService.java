package org.example.Services;

import org.example.Models.Federacao;
import org.example.Repositories.FederacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FederacaoService
{
    @Autowired
    private FederacaoRepository federacaoRepository;

    public Federacao criar ( Federacao federacao )
    {
        federacao.setId( null );
        return federacaoRepository.save( federacao );
    }

    public Federacao buscarPorId(Long id){
        return federacaoRepository.findById(id).orElse(null);
    }

    public List<Federacao> listarTodas ()
    {
        return federacaoRepository.findAll();
    }

    public Federacao salvar ( Federacao federacao )
    {
        return federacaoRepository.save( federacao );
    }

    public void deletar ( Long id )
    {
        federacaoRepository.deleteById( id );
    }
}
