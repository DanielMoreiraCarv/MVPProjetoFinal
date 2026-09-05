package org.example.Services;

import org.example.Models.Federacao;
import org.example.Repositories.FederacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FederacaoService
{
    @Autowired
    private FederacaoRepository federacaoRepository;

    public Federacao buscarPorId(Long id){
        return federacaoRepository.buscarPorId(id).orElse(null);
    }
}
