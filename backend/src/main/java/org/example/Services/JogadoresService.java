package org.example.Services;

import org.example.Models.Jogadores;
import org.example.Repositories.JogadoresRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JogadoresService {
    
    @Autowired
    private JogadoresRepository jogadoresRepository;
    
    public Jogadores criarJogador(Jogadores jogador) {
        jogador.setId(null);
        return jogadoresRepository.save(jogador);
    }
    
    public Jogadores buscarPorId(Long id) {
        return jogadoresRepository.findById(id).orElse(null);
    }
    
    public Jogadores buscarPorNome(String nome) {
        return jogadoresRepository.findByNome(nome).orElse(null);
    }
    
    public Jogadores buscarPorCpf(String cpf) {
        return jogadoresRepository.findByCpf(cpf).orElse(null);
    }
    
    public List<Jogadores> listarTodos() {
        return jogadoresRepository.findAll();
    }
    
    public List<Jogadores> listarPorModalidade(Long idModalidade) {
        return jogadoresRepository.findByModalidadeId(idModalidade);
    }
    
    public List<Jogadores> listarExpulsos() {
        return jogadoresRepository.findByExpulsoTrue();
    }
    
    public List<Jogadores> listarAtivosPorModalidade(Long idModalidade) {
        return jogadoresRepository.findByModalidadeIdAndExpulsoFalse(idModalidade);
    }
    
    public Jogadores atualizarJogador(Long id, Jogadores jogadorAtualizado) {
        Optional<Jogadores> jogadorExistente = jogadoresRepository.findById(id);
        if (jogadorExistente.isPresent()) {
            Jogadores jogador = jogadorExistente.get();
            jogador.setNome(jogadorAtualizado.getNome());
            jogador.setIdade(jogadorAtualizado.getIdade());
            jogador.setNumCamisa(jogadorAtualizado.getNumCamisa());
            jogador.setPosicao(jogadorAtualizado.getPosicao());
            jogador.setModalidade(jogadorAtualizado.getModalidade());
            return jogadoresRepository.save(jogador);
        }
        return null;
    }
    
    public void deletarJogador(Long id) {
        jogadoresRepository.deleteById(id);
    }
    
    public Jogadores expulsarJogador(Long id) {
        Optional<Jogadores> jogador = jogadoresRepository.findById(id);
        if (jogador.isPresent()) {
            Jogadores j = jogador.get();
            j.setExpulso(true);
            return jogadoresRepository.save(j);
        }
        return null;
    }
    
    public Jogadores adicionarGol(Long id) {
        Optional<Jogadores> jogador = jogadoresRepository.findById(id);
        if (jogador.isPresent()) {
            Jogadores j = jogador.get();
            j.setGols(j.getGols() + 1);
            return jogadoresRepository.save(j);
        }
        return null;
    }
    
    public Jogadores adicionarAssistencia(Long id) {
        Optional<Jogadores> jogador = jogadoresRepository.findById(id);
        if (jogador.isPresent()) {
            Jogadores j = jogador.get();
            j.setAssistencias(j.getAssistencias() + 1);
            return jogadoresRepository.save(j);
        }
        return null;
    }
    
    public Jogadores adicionarCartao(Long id) {
        Optional<Jogadores> jogador = jogadoresRepository.findById(id);
        if (jogador.isPresent()) {
            Jogadores j = jogador.get();
            j.setCartoes(j.getCartoes() + 1);
            return jogadoresRepository.save(j);
        }
        return null;
    }
}
