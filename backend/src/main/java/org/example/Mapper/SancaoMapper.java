package org.example.Mapper;

import org.example.Models.Competicao;
import org.example.Models.EnumTipoEsporte;
import org.example.Models.Request.SancaoRequest;
import org.example.Models.Response.SancaoResponse;
import org.example.Models.Sancao;

import java.util.List;

public class SancaoMapper
{
    private SancaoMapper(){}

    public static Sancao toEntity ( SancaoRequest request, Competicao competicao )
    {
        Sancao sancao = new Sancao();
        sancao.setEnumTipoEsporte( EnumTipoEsporte.valueOf( request.tipoEsporte() ) );
        sancao.setCompeticao( competicao );
        sancao.setQuantidadePartidasPadrao( request.qtdPartidas() );

        return sancao;
    }

    public static SancaoResponse toResponse ( Sancao sancao )
    {
        SancaoResponse response = new SancaoResponse( sancao.getId(),
                sancao.getQuantidadePartidasPadrao(), sancao.getEnumTipoEsporte().getDescricao(),
                sancao.getCompeticao().getId());

        return response;
    }

    public static List<SancaoResponse> toResponse ( List<Sancao> sancao )
    {
        // Lista vazia devolve lista vazia, não null: `null` sai como corpo
        // vazio no 200, e o cliente estoura ao interpretar em vez de receber
        // `[]`. Coleção que existe sem elementos é `[]`.
        if ( sancao == null )
        {
            return List.of();
        }

        return sancao.stream().map( SancaoMapper::toResponse ).toList();

    }
}
