package org.example.Services;

import org.example.Fases.OrquestradorDeFases;
import org.example.Fases.ResultadoDaValidacao;
import org.example.Mapper.FaseMapper;
import org.example.Models.Campeonato;
import org.example.Models.Classificado;
import org.example.Models.Fase;
import org.example.Models.Partida;
import org.example.Models.Request.FaseCreateRequest;
import org.example.Models.Request.FaseUpdateRequest;
import org.example.Models.Response.FaseResponse;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.PartidaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FaseService
{
    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private CampeonatoService campeonatoService;

    @Autowired
    private OrquestradorDeFases orquestrador;

    @Autowired
    private PartidaRepository partidaRepository;

    public FaseResponse criarFase ( FaseCreateRequest request )
    {
        Fase fase = FaseMapper.toEntity( request );
        return FaseMapper.toResponse( faseRepository.save( fase ) );
    }

    public Fase buscarFasePorId ( Long id )
    {
        return faseRepository.findById( id ).orElse(null);
    }

    public List<Fase> buscarFases (){
        return faseRepository.findAll();
    }

    public List<Fase> buscarFasePorCampeonato ( Long idCampeonato )
    {
        return faseRepository.findFaseByCampeonatoId( idCampeonato ).orElse( null );
    }

    public FaseResponse atualizarFase ( FaseUpdateRequest request, Fase fase )
    {
        if(request!=null && fase!=null){
            fase.setNome( request.nome() );
            fase.setOrdem( request.ordem() );
            fase.setFasePartida(  request.fasePartida() );

            Campeonato campeonato = campeonatoService.buscarPorId( request.idCampeonato() );
            if(campeonato==null){
                throw new IllegalArgumentException("Campeonato precisa ser informado");
            }
            fase.setCampeonato( campeonato );

            if(request.idFaseSucessora()!=null){
                Fase sucessoro =  buscarFasePorId( request.idFaseSucessora() );
                if(sucessoro==null){
                    throw new IllegalArgumentException("Fase sucessora não encontrada");
                }
                fase.setFaseSucessora( sucessoro );
            }

        }

        return FaseMapper.toResponse( faseRepository.save( fase ) );
    }

    public void deleteFase ( Fase fase )
    {
        faseRepository.delete( fase );
    }

    /** Confere se a fase tem o que precisa, na configuração e na entrada, para ser gerada. */
    public ResultadoDaValidacao validarConfrontos ( Fase fase )
    {
        return orquestrador.validar( fase );
    }

    /** Gera os confrontos da fase a partir do zero, substituindo os que já existiam. */
    public List<Partida> gerarConfrontos ( Fase fase )
    {
        orquestrador.configurar( fase );
        return partidaRepository.findByFaseId( fase.getId() );
    }

    /** Recalcula os confrontos a partir dos resultados já registrados, sem apagar o que já existe. */
    public List<Partida> atualizarConfrontos ( Fase fase, Map<String, String> opcoes )
    {
        orquestrador.atualizar( fase, opcoes );
        return partidaRepository.findByFaseId( fase.getId() );
    }

    public List<Classificado> classificacaoDe ( Fase fase )
    {
        return orquestrador.classificacaoDe( fase );
    }
}
