package org.example.Services;

import org.example.Models.Arbitro;
import org.example.Repositories.ArbitroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArbitroService {
    
    @Autowired
    private ArbitroRepository arbitroRepository;
    
    public Arbitro criarArbitro(Arbitro arbitro) {
        arbitro.setId(null);
        return arbitroRepository.save(arbitro);
    }
    
    public Arbitro buscarPorId(Long id) {
        return arbitroRepository.findById(id).orElse(null);
    }
    
    public Arbitro buscarPorNome(String nome) {
        return arbitroRepository.findByNome(nome).orElse(null);
    }
    
    public List<Arbitro> listarTodos() {
        return arbitroRepository.findAll();
    }
    
    public List<Arbitro> buscarPorFederacao(String federacao) {
        return arbitroRepository.findByFederacao(federacao);
    }
    
    public List<Arbitro> buscarPorCategoria(String categoria) {
        return arbitroRepository.findByCategoria(categoria);
    }
    
    public List<Arbitro> buscarPorFederacaoAndCategoria(String federacao, String categoria) {
        return arbitroRepository.findByFederacaoAndCategoria(federacao, categoria);
    }
    
    public Arbitro atualizarArbitro(Long id, Arbitro arbitroAtualizado) {
        Optional<Arbitro> arbitroExistente = arbitroRepository.findById(id);
        if (arbitroExistente.isPresent()) {
            Arbitro arbitro = arbitroExistente.get();
            arbitro.setNome(arbitroAtualizado.getNome());
            arbitro.setFederacao(arbitroAtualizado.getFederacao());
            arbitro.setCategoria(arbitroAtualizado.getCategoria());
            return arbitroRepository.save(arbitro);
        }
        return null;
    }
    
    public void deletarArbitro(Long id) {
        arbitroRepository.deleteById(id);
    }
    
    public void registrarTrabalho(Long id) {
        Optional<Arbitro> arbitro = arbitroRepository.findById(id);
        if (arbitro.isPresent()) {
            arbitro.get().registrarTrabalho();
            arbitroRepository.save(arbitro.get());
        }
    }
}
