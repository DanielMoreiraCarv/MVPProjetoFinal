package org.example.Services;

import org.example.Mapper.SancaoMapper;
import org.example.Models.Competicao;
import org.example.Models.EnumTipoEsporte;
import org.example.Models.Request.SancaoRequest;
import org.example.Models.Response.SancaoResponse;
import org.example.Models.Sancao;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.SancaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SancaoService
{
    @Autowired
    private SancaoRepository sancaoRepository;

    @Autowired
    private CompeticaoService competicaoService;

    public SancaoResponse criarSancao ( SancaoRequest request )
    {
        Competicao competicao = competicaoService.buscarPorId( request.idCompeticao() );

        if ( competicao == null )
        {
            throw new IllegalArgumentException( "Competicao não encontrado" );
        }

        if ( hasSansaoJaCadastrada( request ) )
        {
            throw new IllegalArgumentException( "Sanção para esse esporte na competição já foi " +
                                                "definido" );
        }

        Sancao sancao = sancaoRepository.save( SancaoMapper.toEntity( request, competicao ) );

        return SancaoMapper.toResponse( sancao );
    }

    public SancaoResponse atualizarSancao (Long id, SancaoRequest request )
    {
        Sancao sancao = findById( id );

        if(sancao == null){
            throw new IllegalArgumentException("Sanção não encontrada");
        }

        Competicao competicao = competicaoService.buscarPorId( request.idCompeticao() );

        if(competicao == null){
            throw new IllegalArgumentException("Competicao não encontrado");
        }

        sancao.setCompeticao(  competicao ) ;
        sancao.setEnumTipoEsporte( EnumTipoEsporte.deCodigo( request.tipoEsporte() ) );
        sancao.setQuantidadePartidasPadrao( request.qtdPartidas() );

        return SancaoMapper.toResponse( sancaoRepository.save( sancao ) );

    }

    public void deletarSancao ( Long id )
    {
        sancaoRepository.deleteById( id );
    }

    public Sancao findById ( Long id )
    {
        Sancao sancao = sancaoRepository.findById( id ).orElse( null );

        if ( sancao == null )
        {
            return null;
        }

        return  sancao ;
    }

    public List<SancaoResponse> findAll ()
    {
        return SancaoMapper.toResponse( sancaoRepository.findAll() );
    }

    public List<SancaoResponse> findByCompeticao ( Long id )
    {
        return SancaoMapper.toResponse( sancaoRepository.findAllByCompeticaoId( id ) );
    }

    public Boolean hasSansaoJaCadastrada ( SancaoRequest request )
    {
        return sancaoRepository.countSancoesCompeticoesEEsporte( request.idCompeticao(),
                EnumTipoEsporte.deCodigo( request.tipoEsporte() ) ) > 0;
    }
}
