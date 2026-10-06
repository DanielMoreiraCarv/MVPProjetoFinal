package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.EnumFasePartida;
import org.example.Models.EnumTipoDeDado;
import org.example.Models.Fase;
import org.example.Models.ValorAtributoFase;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Todos contra todos, tabela única.
 *
 * `EnumFasePartida` declara três tipos e só havia dois registrados:
 * `RegistroDeEstrategias.para(PONTOS_CORRIDOS)` lançava exceção. Era o formato
 * mais comum em competição amadora, e o único que faltava.
 *
 * A implementação delega para a fase de grupos com um grupo só, que é
 * literalmente a mesma disputa — é o que o comentário de `EstrategiaDeGrupos`
 * já dizia. Escrever de novo o rodízio, a geração idempotente de confrontos e
 * o cálculo de classificação daria duas cópias para manter, e o desempate é
 * justamente onde uma cópia esquecida diverge da outra.
 *
 * O que não se delega é a lista de atributos: quem monta uma tabela única não
 * escolhe número nem tamanho de grupo, e oferecer esses campos na tela seria
 * oferecer uma decisão que não existe.
 */
@Component
public class EstrategiaDePontosCorridos implements EstrategiaDeFase
{
    public static final String IDA_E_VOLTA = EstrategiaDeGrupos.IDA_E_VOLTA;
    public static final String CRITERIOS = EstrategiaDeGrupos.CRITERIOS;
    public static final String PONTOS_VITORIA = EstrategiaDeGrupos.PONTOS_VITORIA;
    public static final String PONTOS_EMPATE = EstrategiaDeGrupos.PONTOS_EMPATE;
    public static final String PONTOS_DERROTA = EstrategiaDeGrupos.PONTOS_DERROTA;

    private final EstrategiaDeGrupos grupos;

    public EstrategiaDePontosCorridos ( EstrategiaDeGrupos grupos )
    {
        this.grupos = grupos;
    }

    @Override
    public EnumFasePartida tipo ()
    {
        return EnumFasePartida.PONTOS_CORRIDOS;
    }

    @Override
    public List<AtributoFase> atributosSuportados ()
    {
        return List.of(
                new AtributoFase( tipo(), IDA_E_VOLTA, EnumTipoDeDado.BOOLEANO, false, "false",
                        "Se cada confronto tem partida de volta (turno e returno)" ),
                new AtributoFase( tipo(), CRITERIOS, EnumTipoDeDado.LISTA_DE_TEXTO, false,
                        "SALDO_GOLS,GOLS_PRO,VITORIAS",
                        "Critérios de desempate, na ordem, aplicados depois dos pontos" ),
                new AtributoFase( tipo(), PONTOS_VITORIA, EnumTipoDeDado.INTEIRO, false, "3",
                        "Pontos por vitória" ),
                new AtributoFase( tipo(), PONTOS_EMPATE, EnumTipoDeDado.INTEIRO, false, "1",
                        "Pontos por empate" ),
                new AtributoFase( tipo(), PONTOS_DERROTA, EnumTipoDeDado.INTEIRO, false, "0",
                        "Pontos por derrota" ) );
    }

    /**
     * A ordem da entrada não importa: numa tabela única todo mundo joga contra
     * todo mundo, então não há semeadura a respeitar.
     */
    @Override
    public boolean aceitaEmpateNaClassificacao ()
    {
        return true;
    }

    @Override
    public ResultadoDaValidacao validar ( ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        List<String> erros = new ArrayList<>();

        if ( entrada.size() < 2 )
        {
            erros.add( "Pontos corridos precisa de ao menos 2 equipes; entram " + entrada.size() + "." );
        }

        return new ResultadoDaValidacao( erros );
    }

    @Override
    public void configurar ( Fase fase, ConfiguracaoDaFase configuracao, List<Classificado> entrada )
    {
        grupos.configurar( fase, comGrupoUnico( configuracao ), entrada );
    }

    @Override
    public void atualizar ( Fase fase, ConfiguracaoDaFase configuracao, Map<String, String> opcoes )
    {
        grupos.atualizar( fase, comGrupoUnico( configuracao ), opcoes );
    }

    @Override
    public List<Classificado> classificacao ( Fase fase, ConfiguracaoDaFase configuracao )
    {
        return grupos.classificacao( fase, comGrupoUnico( configuracao ) );
    }

    @Override
    public boolean temTabelaDePontos ()
    {
        return true;
    }

    @Override
    public List<LinhaDaTabela> tabela ( Fase fase, ConfiguracaoDaFase configuracao,
            List<Classificado> entrada )
    {
        return grupos.tabela( fase, comGrupoUnico( configuracao ), entrada );
    }

    /**
     * A configuração que a fase de grupos espera, com um grupo fixo e os
     * valores desta fase repassados.
     *
     * Os atributos são declarados pelo tipo `GRUPOS` porque é a estratégia de
     * grupos que vai lê-los; os valores vêm dos atributos declarados aqui, que
     * têm o mesmo código.
     */
    private ConfiguracaoDaFase comGrupoUnico ( ConfiguracaoDaFase configuracao )
    {
        List<AtributoFase> declarados = grupos.atributosSuportados();
        List<ValorAtributoFase> valores = new ArrayList<>();

        for ( AtributoFase atributo : declarados )
        {
            String valor = EstrategiaDeGrupos.NUMERO_DE_GRUPOS.equals( atributo.getCodigo() )
                    ? "1"
                    : configuracao.texto( atributo.getCodigo() );

            if ( valor != null )
            {
                ValorAtributoFase declarado = new ValorAtributoFase();
                declarado.setAtributo( atributo );
                declarado.setValor( valor );
                valores.add( declarado );
            }
        }

        return new ConfiguracaoDaFase( declarados, valores );
    }
}
