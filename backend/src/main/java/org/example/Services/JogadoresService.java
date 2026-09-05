package org.example.Services;

import org.example.Models.Jogadores;
import org.example.Models.Modalidade;
import org.example.Models.Request.JogadoresCreateRequest;
import org.example.Models.Request.JogadoresUpdateRequest;
import org.example.Models.Time;
import org.example.Repositories.JogadoresRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JogadoresService {
    
    @Autowired
    private JogadoresRepository jogadoresRepository;

    @Autowired
    private ModalidadeService modalidadeService;
    
    public Jogadores criarJogador( JogadoresCreateRequest request, Time time ) {
        Jogadores jogador = new Jogadores();

        jogador.setNome( request.nome() );
        jogador.setIdade(  request.idade() );
        jogador.setCpf(  request.cpf() );
        jogador.setModalidade( modalidadeService.buscarPorId( request.idModalidade() ));
        jogador.setTime(  time );

        jogadoresRepository.save( jogador );
        return jogador;
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
    
    public Jogadores atualizarJogador(Long id, JogadoresUpdateRequest jogadorAtualizado) {
        Optional<Jogadores> jogadorExistente = jogadoresRepository.findById(id);
        if (jogadorExistente.isPresent()) {
            Jogadores jogador = jogadorExistente.get();
            jogador.setNome(jogadorAtualizado.nome());
            jogador.setIdade(jogadorAtualizado.idade());
            jogador.setNumCamisa(jogadorAtualizado.numCamisa());
            jogador.setCpf(jogadorAtualizado.cpf());

            Modalidade modalidade =
                    modalidadeService.buscarPorId( jogadorAtualizado.idModalidade() );
            jogador.setModalidade(modalidade);
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
