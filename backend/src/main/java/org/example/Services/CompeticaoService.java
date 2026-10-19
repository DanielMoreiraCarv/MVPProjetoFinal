package org.example.Services;

import org.example.Exception.CompeticaoCreateException;
import org.example.Exception.NaoEncontradoException;
import org.example.Exception.CompeticaoUpdateException;
import org.example.Mapper.CompeticaoMapper;
import org.example.Models.Competicao;
import org.example.Models.EnumEstadoCompeticao;
import org.example.Models.Request.CompeticaoCreateRequest;
import org.example.Models.Request.CompeticaoUpdateRequest;
import org.example.Models.Equipe;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.SancaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompeticaoService {
    
    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private SancaoRepository sancaoRepository;
    
    public Competicao criarCompeticao(Competicao competicao) {
        competicao.setId(null);
        return competicaoRepository.save(competicao);
    }

    public Competicao criar(Competicao competicao) throws CompeticaoCreateException {
        competicao.setId(null);
        return competicaoRepository.save(competicao);
    }

    public Competicao atualizar(CompeticaoUpdateRequest updateRequest) throws CompeticaoUpdateException {
        Competicao competicao = competicaoRepository.findById(updateRequest.id()).orElse(null);
        if (competicao == null) {
            return null;
        }
        Competicao atualizado = CompeticaoMapper.toEntity(updateRequest, competicao);
        return competicaoRepository.save(atualizado);
    }

    public Competicao buscarPorId(Long id) {
        return competicaoRepository.findById(id).orElse(null);
    }
    
    public Competicao buscarPorNome(String nome) {
        return competicaoRepository.findByNome(nome).orElse(null);
    }
    
    public List<Competicao> listarTodos() {
        return competicaoRepository.findAll();
    }
    
    public List<Competicao> listarMataMata() {
        return competicaoRepository.findByMataMata(true);
    }
    
    public List<Competicao> listarPontosCorridos() {
        return competicaoRepository.findByMataMata(false);
    }

    public List<Competicao> listarPorAdministracao(Long idAdministracao) {
        return competicaoRepository.findByAdministracaoId(idAdministracao);
    }

    public Competicao atualizarCompeticao(Long id, Competicao competicaoAtualizado) {
        Optional<Competicao> competicaoExistente = competicaoRepository.findById(id);
        if (competicaoExistente.isPresent()) {
            Competicao competicao = competicaoExistente.get();
            competicao.setNome(competicaoAtualizado.getNome());
            competicao.setMataMata(competicaoAtualizado.isMataMata());
            competicao.setLstModalidades(competicaoAtualizado.getLstModalidades());
            return competicaoRepository.save(competicao);
        }
        return null;
    }
    
    /**
     * Só sai do banco a competição que não deixou rastro. Com partida jogada
     * ou agendada, o caminho é cancelar: o histórico continua valendo.
     */
    public void deletarCompeticao(Long id) {
        Competicao competicao = competicaoRepository.findById(id)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", id));

        int partidas = partidaRepository.findByCompeticaoId(id).size();
        if (partidas > 0) {
            throw new IllegalArgumentException(
                    "A competição " + competicao.getNome() + " tem " + partidas
                            + (partidas == 1 ? " partida" : " partidas")
                            + ". Cancele a competição em vez de excluí-la.");
        }

        int fases = faseRepository.findFaseByCompeticaoId(id).map(List::size).orElse(0);
        int sancoes = sancaoRepository.findAllByCompeticaoId(id).size();
        if (fases > 0 || sancoes > 0) {
            throw new IllegalArgumentException(
                    "A competição " + competicao.getNome() + " ainda tem "
                            + quantidade(fases, "fase", "fases")
                            + (fases > 0 && sancoes > 0 ? " e " : "")
                            + quantidade(sancoes, "sanção", "sanções")
                            + ". Remova-as antes de excluir a competição.");
        }

        competicaoRepository.delete(competicao);
    }

    private static String quantidade(int total, String singular, String plural) {
        return total == 0 ? "" : total + " " + (total == 1 ? singular : plural);
    }
    
    public Competicao mudarEstado(Long id, EnumEstadoCompeticao destino) {
        Competicao competicao = competicaoRepository.findById(id)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", id));

        if (destino == EnumEstadoCompeticao.EM_ANDAMENTO
                && (competicao.getLstEquipes() == null || competicao.getLstEquipes().size() < 2)) {
            throw new IllegalArgumentException(
                    "Uma competição precisa de ao menos duas equipes inscritas para começar.");
        }

        competicao.mudarEstadoPara(destino);
        return competicaoRepository.save(competicao);
    }

    /** Recusa alteração em competição que não aceita mais mudança. */
    public void exigirEditavel(Competicao competicao) {
        if (competicao.getEstado().estaEncerrada()) {
            throw new IllegalArgumentException(
                    "A competição está " + competicao.getEstado() + " e não aceita alteração.");
        }
    }

    public Competicao adicionarEquipeACompeticao(Long idCompeticao, Equipe equipe) {
        Competicao competicao = competicaoRepository.findById(idCompeticao)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", idCompeticao));

        exigirEditavel(competicao);
        competicao.adicionarEquipe(equipe);
        return competicaoRepository.save(competicao);
    }

    public Competicao removerEquipeDaCompeticao(Long idCompeticao, Long idEquipe) {
        Competicao competicao = competicaoRepository.findById(idCompeticao)
                .orElseThrow(() -> NaoEncontradoException.de("Competição", idCompeticao));

        exigirEditavel(competicao);

        if (!competicao.removerEquipe(idEquipe)) {
            throw new IllegalArgumentException(
                    "A equipe não está inscrita em " + competicao.getNome() + ".");
        }

        return competicaoRepository.save(competicao);
    }
}
