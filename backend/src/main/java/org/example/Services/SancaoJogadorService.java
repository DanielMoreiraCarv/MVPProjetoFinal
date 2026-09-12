package org.example.Services;

import org.example.Models.Jogadores;
import org.example.Models.Partida;
import org.example.Models.Request.SancaoJogadorRequest;
import org.example.Models.Response.SancaoJogadorResponse;
import org.example.Models.Sancao;
import org.example.Models.SancaoJogador;
import org.example.Repositories.SancaoJogadorRespository;
import org.example.Repositories.SancaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SancaoJogadorService
{
    @Autowired
    private SancaoRepository sancaoRepository;

    @Autowired
    private SancaoJogadorRespository sancaoJogadorRespository;

    @Autowired
    private JogadoresService jogadoresService;

    @Autowired
    private PartidaService partidaService;

    public SancaoJogador criarSancaoJogador ( SancaoJogadorRequest request )
    {
        Sancao sancao = sancaoRepository.findById( request.idSancao() ).orElse( null );

        if ( sancao == null )
        {
            throw new IllegalArgumentException( "Não possí uma regra de sanções cadastrada para " +
                                                "essa " +
                                                "competição" );
        }

        Jogadores jogador = jogadoresService.buscarPorId( request.idJogador() );

        if ( jogador == null )
        {
            throw new IllegalArgumentException( "Jogador não encontrado" );
        }

        Partida partida = partidaService.buscarPorId( request.idPartida() );

        if ( partida == null )
        {
            throw new IllegalArgumentException( "Partida não encontrada" );
        }

        SancaoJogador sancaoJogador = new SancaoJogador();
        sancaoJogador.setSancao( sancao );
        sancaoJogador.setJogador( jogador );
        sancaoJogador.setPartidaInicioSancao( partida );
        sancaoJogador.setAtivo( true );
        sancaoJogador.setExcao( request.exceao() );
        sancaoJogador.setPartidasExcecao( request.qtdPartidasExcerssao() );
        sancaoJogador.setJustificativa( request.justificativa() );
        sancaoJogador.setPartidasRestantes( calcularPartidasRestantesSancao( sancao, request ) );

        return sancaoJogador;

    }

    private Integer calcularPartidasRestantesSancao ( Sancao sancao, SancaoJogadorRequest request )
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

    public void deleteSancaoJogador ( Long id )
    {
        SancaoJogador sj =  sancaoJogadorRespository.findById( id ).orElse( null );

        if( sj == null )
        {
            throw new IllegalArgumentException("Sanção para o jogador não encontrada");
        }

        sancaoJogadorRespository.deleteById( id );
    }

    public void inativarSancaoJogador(Long id){
        SancaoJogador sj =  sancaoJogadorRespository.findById( id ).orElse( null );

        if( sj == null )
        {
            throw new IllegalArgumentException("Sanção para o jogador não encontrada");
        }

        sj.setAtivo(  false );

        sancaoJogadorRespository.save( sj );

    }

    public List<SancaoJogador> findAll ()
    {
        return sancaoJogadorRespository.findAll();
    }

    public SancaoJogador findById ( Long id )
    {
        return sancaoJogadorRespository.findById( id ).orElse( null );
    }

    public SancaoJogador update ( SancaoJogadorRequest request, Long id )
    {
        SancaoJogador sj = findById( id );

        if ( sj == null ){
            throw new IllegalArgumentException("Sanção não encotrada");
        }

        sj.setExcao(  request.exceao() );
        sj.setJustificativa( request.justificativa() );
        sj.setPartidasExcecao(  request.qtdPartidasExcerssao() );


        Jogadores j =  jogadoresService.buscarPorId( request.idJogador() );

        if(j == null){
            throw new IllegalArgumentException("Jogador não encontrado");
        }

        sj.setJogador( j );

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

        return sancaoJogadorRespository.save( sj );
    }
}
