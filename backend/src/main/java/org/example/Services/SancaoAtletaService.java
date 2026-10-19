package org.example.Services;

import org.example.Models.Atleta;
import org.example.Models.Partida;
import org.example.Models.Request.SancaoAtletaRequest;
import org.example.Models.Response.SancaoAtletaResponse;
import org.example.Models.Sancao;
import org.example.Models.SancaoAtleta;
import org.example.Repositories.SancaoAtletaRepository;
import org.example.Repositories.SancaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SancaoAtletaService
{
    @Autowired
    private SancaoRepository sancaoRepository;

    @Autowired
    private SancaoAtletaRepository sancaoAtletaRespository;

    @Autowired
    private AtletaService atletaService;

    @Autowired
    private PartidaService partidaService;

    public SancaoAtleta criarSancaoAtleta ( SancaoAtletaRequest request )
    {
        Sancao sancao = sancaoRepository.findById( request.idSancao() ).orElse( null );

        if ( sancao == null )
        {
            throw new IllegalArgumentException( "Não possí uma regra de sanções cadastrada para " +
                                                "essa " +
                                                "competição" );
        }

        Atleta atleta = atletaService.buscarPorId( request.idAtleta() );

        if ( atleta == null )
        {
            throw new IllegalArgumentException( "Atleta não encontrado" );
        }

        Partida partida = partidaService.buscarPorId( request.idPartida() );

        if ( partida == null )
        {
            throw new IllegalArgumentException( "Partida não encontrada" );
        }

        SancaoAtleta sancaoAtleta = new SancaoAtleta();
        sancaoAtleta.setSancao( sancao );
        sancaoAtleta.setAtleta( atleta );
        sancaoAtleta.setPartidaInicioSancao( partida );
        sancaoAtleta.setAtivo( true );
        sancaoAtleta.setExcecao( request.exceao() );
        sancaoAtleta.setPartidasExcecao( request.qtdPartidasExcerssao() );
        sancaoAtleta.setJustificativa( request.justificativa() );
        sancaoAtleta.setPartidasRestantes( calcularPartidasRestantesSancao( sancao, request ) );

        return sancaoAtleta;

    }

    private Integer calcularPartidasRestantesSancao ( Sancao sancao, SancaoAtletaRequest request )
    {
        if ( sancao == null )
        {
            throw new IllegalArgumentException( "Sanção não encontrada" );
        }

        if ( request != null && request.exceao() )
        {
            return request.qtdPartidasExcerssao();
        }
        return sancao.getQuantidadePartidasPadrao();
    }

    public void deleteSancaoAtleta ( Long id )
    {
        SancaoAtleta sj =  sancaoAtletaRespository.findById( id ).orElse( null );

        if( sj == null )
        {
            throw new IllegalArgumentException("Sanção para o atleta não encontrada");
        }

        sancaoAtletaRespository.deleteById( id );
    }

    public void inativarSancaoAtleta(Long id){
        SancaoAtleta sj =  sancaoAtletaRespository.findById( id ).orElse( null );

        if( sj == null )
        {
            throw new IllegalArgumentException("Sanção para o atleta não encontrada");
        }

        sj.setAtivo(  false );

        sancaoAtletaRespository.save( sj );

    }

    public List<SancaoAtleta> findAll ()
    {
        return sancaoAtletaRespository.findAll();
    }

    public SancaoAtleta findById ( Long id )
    {
        return sancaoAtletaRespository.findById( id ).orElse( null );
    }

    public SancaoAtleta update ( SancaoAtletaRequest request, Long id )
    {
        SancaoAtleta sj = findById( id );

        if ( sj == null ){
            throw new IllegalArgumentException("Sanção não encotrada");
        }

        sj.setExcecao(  request.exceao() );
        sj.setJustificativa( request.justificativa() );
        sj.setPartidasExcecao(  request.qtdPartidasExcerssao() );


        Atleta j =  atletaService.buscarPorId( request.idAtleta() );

        if(j == null){
            throw new IllegalArgumentException("Atleta não encontrado");
        }

        sj.setAtleta( j );

        Partida p =  partidaService.buscarPorId( request.idPartida() );

        if(p == null){
            throw new IllegalArgumentException("Partida não encontrada");
        }

        sj.setPartidaInicioSancao( p );

        Sancao s =  sancaoRepository.findById( request.idSancao() ).orElse( null );

        if ( s == null ){
            throw new IllegalArgumentException("Sanção não encontrada");
        }

        sj.setPartidasRestantes( calcularPartidasRestantesSancao( s,request ) );

        return sancaoAtletaRespository.save( sj );
    }
}
