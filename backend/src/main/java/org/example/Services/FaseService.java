package org.example.Services;

import org.example.Mapper.FaseMapper;
import org.example.Models.Campeonato;
import org.example.Models.Fase;
import org.example.Models.Request.FaseCreateRequest;
import org.example.Models.Request.FaseUpdateRequest;
import org.example.Models.Response.FaseResponse;
import org.example.Repositories.FaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FaseService
{
    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private CampeonatoService campeonatoService;

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
}
