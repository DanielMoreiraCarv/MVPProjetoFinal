package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.EnumTipoDeDado;
import org.example.Models.Fase;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Estratégia mínima, só para exercitar o contrato: registro por tipo, tabela
 * de atributos, validação e idempotência. Não gera partidas — isso é das
 * estratégias reais.
 */
@Component
public class EstrategiaFalsa implements EstrategiaDeFase
{
    static final String TAMANHO = "tamanhoDoGrupo";
    static final String IDA_E_VOLTA = "idaEVolta";

    final List<String> chamadasDeAtualizar = new ArrayList<>();

    @Override
    public EnumFasePartida tipo ()
    {
        return EnumFasePartida.PONTOS_CORRIDOS;
    }

    @Override
    public List<AtributoFase> atributosSuportados ()
    {
        return List.of(
                new AtributoFase( tipo(), TAMANHO, EnumTipoDeDado.INTEIRO, true, null,
                        "Quantos times por grupo" ),
                new AtributoFase( tipo(), IDA_E_VOLTA, EnumTipoDeDado.BOOLEANO, false, "false",
                        "Se os confrontos têm partida de volta" ) );
    }

    @Override
    public boolean aceitaEmpateNaEntrada ()
    {
        return true;
    }

    @Override
    public ResultadoDaValidacao validar ( ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        Integer tamanho = configuracao.inteiro( TAMANHO );

        if ( tamanho != null && !entrada.isEmpty() && entrada.size() % tamanho != 0 )
        {
            return ResultadoDaValidacao.com( "os " + entrada.size()
                    + " times não se dividem em grupos de " + tamanho );
        }

        return ResultadoDaValidacao.valido();
    }

    @Override
    public void configurar ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        chamadasDeAtualizar.add( "configurar:" + entrada.size() );
    }

    @Override
    public void atualizar ( Fase fase, ConfiguracaoDaFase configuracao, Map<String, String> opcoes )
    {
        chamadasDeAtualizar.add( "atualizar:" + opcoes.size() );
    }

    @Override
    public List<Classificado> classificacao ( Fase fase, ConfiguracaoDaFase configuracao )
    {
        // Derivada, não guardada: a mesma entrada devolve sempre o mesmo.
        List<Classificado> ordem = new ArrayList<>();
        int posicao = 1;
        for ( Classificado classificado : entradaFixa() )
        {
            ordem.add( new Classificado( posicao++, classificado.idTime() ) );
        }
        return ordem;
    }

    private List<Classificado> entradaFixa ()
    {
        return List.of( new Classificado( 1, 1L ), new Classificado( 1, 2L ) );
    }
}
