package org.example.Config;

import org.example.Fases.EstrategiaDeFase;
import org.example.Fases.RegistroDeEstrategias;
import org.example.Models.AtributoFase;
import org.example.Repositories.AtributoFaseRepository;
import org.example.Repositories.ValorAtributoFaseRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Cada estratégia declara os atributos que aceita; a tabela é o reflexo dessa
 * declaração. A carga é idempotente e atualiza o que mudou.
 */
@Component
public class CargaDeAtributosDeFase implements ApplicationRunner
{
    private final RegistroDeEstrategias registro;
    private final AtributoFaseRepository atributoRepository;
    private final ValorAtributoFaseRepository valorRepository;

    public CargaDeAtributosDeFase ( RegistroDeEstrategias registro,
            AtributoFaseRepository atributoRepository,
            ValorAtributoFaseRepository valorRepository )
    {
        this.registro = registro;
        this.atributoRepository = atributoRepository;
        this.valorRepository = valorRepository;
    }

    @Override
    public void run ( ApplicationArguments args )
    {
        Set<String> declarados = new HashSet<>();

        for ( EstrategiaDeFase estrategia : registro.todas() )
        {
            for ( AtributoFase declarado : estrategia.atributosSuportados() )
            {
                declarados.add( chave( declarado ) );
                atributoRepository
                        .findByTipoFaseAndCodigo( declarado.getTipoFase(), declarado.getCodigo() )
                        .ifPresentOrElse( existente -> atualizar( existente, declarado ),
                                () -> atributoRepository.save( declarado ) );
            }
        }

        removerNaoDeclarados( declarados );
    }

    private String chave ( AtributoFase atributo )
    {
        return atributo.getTipoFase() + "." + atributo.getCodigo();
    }

    /**
     * A tabela é o reflexo do que as estratégias declaram: atributo que deixou
     * de ser declarado sai. Os que já têm valor gravado em alguma instância
     * ficam, para não destruir configuração existente em silêncio.
     */
    private void removerNaoDeclarados ( Set<String> declarados )
    {
        Set<Long> emUso = valorRepository.findAll().stream()
                                         .map( valor -> valor.getAtributo().getId() )
                                         .collect( Collectors.toSet() );

        for ( AtributoFase existente : atributoRepository.findAll() )
        {
            if ( !declarados.contains( chave( existente ) ) && !emUso.contains( existente.getId() ) )
            {
                atributoRepository.delete( existente );
            }
        }
    }

    private void atualizar ( AtributoFase existente, AtributoFase declarado )
    {
        existente.setTipoDado( declarado.getTipoDado() );
        existente.setObrigatorio( declarado.isObrigatorio() );
        existente.setValorPadrao( declarado.getValorPadrao() );
        existente.setDescricao( declarado.getDescricao() );
        atributoRepository.save( existente );
    }
}
