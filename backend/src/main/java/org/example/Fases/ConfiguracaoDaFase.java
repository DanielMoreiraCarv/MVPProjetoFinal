package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.ValorAtributoFase;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Leitura tipada dos atributos de uma instância de fase. Cai no valor padrão
 * declarado pelo atributo quando a instância não informou nada.
 */
public class ConfiguracaoDaFase
{
    private final Map<String, String> valores;
    private final Map<String, AtributoFase> declarados;

    public ConfiguracaoDaFase ( List<AtributoFase> declarados, List<ValorAtributoFase> valores )
    {
        this.declarados = declarados.stream()
                                    .collect( Collectors.toMap( AtributoFase::getCodigo,
                                            Function.identity(), ( a, b ) -> a ) );
        this.valores = valores.stream()
                              .filter( v -> v.getAtributo() != null && v.getValor() != null )
                              .collect( Collectors.toMap( v -> v.getAtributo().getCodigo(),
                                      ValorAtributoFase::getValor, ( a, b ) -> a ) );
    }

    private String bruto ( String codigo )
    {
        String informado = valores.get( codigo );
        if ( informado != null )
        {
            return informado;
        }

        AtributoFase atributo = declarados.get( codigo );
        return atributo == null ? null : atributo.getValorPadrao();
    }

    public boolean informado ( String codigo )
    {
        return bruto( codigo ) != null;
    }

    public Integer inteiro ( String codigo )
    {
        String valor = bruto( codigo );
        try
        {
            return valor == null ? null : Integer.valueOf( valor.trim() );
        }
        catch ( NumberFormatException excecao )
        {
            throw new IllegalArgumentException(
                    "atributo " + codigo + " deveria ser um número inteiro, veio: " + valor );
        }
    }

    public int inteiroOu ( String codigo, int padrao )
    {
        Integer valor = inteiro( codigo );
        return valor == null ? padrao : valor;
    }

    public boolean booleano ( String codigo )
    {
        return Boolean.parseBoolean( String.valueOf( bruto( codigo ) ).trim() );
    }

    public String texto ( String codigo )
    {
        return bruto( codigo );
    }

    public List<String> lista ( String codigo )
    {
        String valor = bruto( codigo );
        if ( valor == null || valor.isBlank() )
        {
            return List.of();
        }

        return Arrays.stream( valor.split( "," ) ).map( String::trim )
                     .filter( item -> !item.isEmpty() ).toList();
    }
}
