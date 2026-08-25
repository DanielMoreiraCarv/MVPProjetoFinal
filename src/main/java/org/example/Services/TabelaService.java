package org.example.Services;

import org.example.Models.Partida;
import org.example.Models.Tabela;
import org.example.Repositories.TabelaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TabelaService {
    
    @Autowired
    private TabelaRepository tabelaRepository;
    
    public Tabela criarTabela(Tabela tabela) {
        tabela.setId(null);
        return tabelaRepository.save(tabela);
    }
    
    public Tabela buscarPorId(Long id) {
        return tabelaRepository.findById(id).orElse(null);
    }
    
    public List<Tabela> listarTodas() {
        return tabelaRepository.findAll();
    }
    
    public Tabela buscarPorCampeonato(Long idCampeonato) {
        return tabelaRepository.findByIdCampeonato(idCampeonato).orElse(null);
    }
    
    public Tabela atualizarTabela(Long id, Tabela tabelaAtualizada) {
        Optional<Tabela> tabelaExistente = tabelaRepository.findById(id);
        if (tabelaExistente.isPresent()) {
            Tabela tabela = tabelaExistente.get();
            tabela.setPartidas(tabelaAtualizada.getPartidas());
            tabela.setIdCampeonato(tabelaAtualizada.getIdCampeonato());
            return tabelaRepository.save(tabela);
        }
        return null;
    }
    
    public Tabela adicionarPartidaATabela(Long idTabela, Partida partida) {
        Optional<Tabela> tabela = tabelaRepository.findById(idTabela);
        if (tabela.isPresent()) {
            Tabela t = tabela.get();
            if (t.getPartidas() != null) {
                t.getPartidas().add(partida);
                return tabelaRepository.save(t);
            }
        }
        return null;
    }
    
    public List<Partida> listarPartidas(Long idTabela) {
        Optional<Tabela> tabela = tabelaRepository.findById(idTabela);
        if (tabela.isPresent()) {
            return tabela.get().getPartidas();
        }
        return null;
    }
    
    public void deletarTabela(Long id) {
        tabelaRepository.deleteById(id);
    }
}
