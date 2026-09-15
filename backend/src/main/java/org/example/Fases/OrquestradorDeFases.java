package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.Fase;
import org.example.Models.Time;
import org.example.Models.ValorAtributoFase;
import org.example.Repositories.AtributoFaseRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.ValorAtributoFaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Liga as fases entre si. Uma fase não conhece a anterior nem a seguinte: é
 * daqui que sai a entrada de cada uma e é aqui que a saída de uma vira a
 * entrada da outra.
 */
@Service
public class OrquestradorDeFases
{
    private final RegistroDeEstrategias registro;
    private final FaseRepository faseRepository;
    private final AtributoFaseRepository atributoRepository;
    private final ValorAtributoFaseRepository valorRepository;

    public OrquestradorDeFases ( RegistroDeEstrategias registro, FaseRepository faseRepository,
            AtributoFaseRepository atributoRepository,
            ValorAtributoFaseRepository valorRepository )
    {
        this.registro = registro;
        this.faseRepository = faseRepository;
        this.atributoRepository = atributoRepository;
        this.valorRepository = valorRepository;
    }

    public ConfiguracaoDaFase configuracaoDe ( Fase fase )
    {
        return new ConfiguracaoDaFase(
                atributoRepository.findByTipoFase( fase.getFasePartida() ),
                valorRepository.findByFaseId( fase.getId() ) );
    }

    /**
     * A entrada da fase: a classificação da fase anterior, ou — na primeira —
     * os times inscritos no campeonato, todos na posição 1, porque ainda não
     * houve nada que os ordenasse.
     */
    public List<Classificado> entradaDe ( Fase fase )
    {
        return faseRepository.findByFaseSucessoraId( fase.getId() )
                             .map( this::classificacaoDe )
                             .orElseGet( () -> timesInscritos( fase ) );
    }

    private List<Classificado> timesInscritos ( Fase fase )
    {
        if ( fase.getCampeonato() == null || fase.getCampeonato().getLstTimes() == null )
        {
            return Collections.emptyList();
        }

        List<Classificado> entrada = new ArrayList<>();
        for ( Time time : fase.getCampeonato().getLstTimes() )
        {
            entrada.add( new Classificado( 1, time.getId() ) );
        }
        return entrada;
    }

    public ResultadoDaValidacao validar ( Fase fase )
    {
        EstrategiaDeFase estrategia = registro.para( fase.getFasePartida() );
        ConfiguracaoDaFase configuracao = configuracaoDe( fase );
        List<Classificado> entrada = entradaDe( fase );

        ResultadoDaValidacao obrigatorios = conferirObrigatorios( fase, configuracao );
        ResultadoDaValidacao empates = conferirEmpates( estrategia, entrada );

        return obrigatorios.mais( empates ).mais( estrategia.validar( configuracao, entrada ) );
    }

    private ResultadoDaValidacao conferirObrigatorios ( Fase fase, ConfiguracaoDaFase configuracao )
    {
        List<String> faltando = new ArrayList<>();

        for ( AtributoFase atributo : atributoRepository.findByTipoFase( fase.getFasePartida() ) )
        {
            if ( atributo.isObrigatorio() && !configuracao.informado( atributo.getCodigo() ) )
            {
                faltando.add( "atributo obrigatório não informado: " + atributo.getCodigo() );
            }
        }

        return new ResultadoDaValidacao( faltando );
    }

    private ResultadoDaValidacao conferirEmpates ( EstrategiaDeFase estrategia,
            List<Classificado> entrada )
    {
        if ( estrategia.aceitaEmpateNaEntrada() )
        {
            return ResultadoDaValidacao.valido();
        }

        long distintas = entrada.stream().map( Classificado::posicao ).distinct().count();

        if ( distintas < entrada.size() )
        {
            return ResultadoDaValidacao.com( "a fase " + estrategia.tipo()
                    + " não aceita empates na entrada, e a classificação recebida tem posições repetidas" );
        }

        return ResultadoDaValidacao.valido();
    }

    @Transactional
    public void configurar ( Fase fase )
    {
        ResultadoDaValidacao validacao = validar( fase );

        if ( !validacao.ehValido() )
        {
            throw new IllegalStateException(
                    "não é possível configurar a fase: " + validacao.mensagem() );
        }

        registro.para( fase.getFasePartida() )
                .configurar( fase, configuracaoDe( fase ), entradaDe( fase ) );
    }

    @Transactional
    public void atualizar ( Fase fase, Map<String, String> opcoes )
    {
        registro.para( fase.getFasePartida() )
                .atualizar( fase, configuracaoDe( fase ),
                        opcoes == null ? Map.of() : opcoes );
    }

    public List<Classificado> classificacaoDe ( Fase fase )
    {
        return registro.para( fase.getFasePartida() )
                       .classificacao( fase, configuracaoDe( fase ) );
    }

    @Transactional
    public void definirAtributo ( Fase fase, String codigo, String valor )
    {
        AtributoFase atributo = atributoRepository
                .findByTipoFaseAndCodigo( fase.getFasePartida(), codigo )
                .orElseThrow( () -> new IllegalArgumentException( "a fase " + fase.getFasePartida()
                        + " não aceita o atributo " + codigo ) );

        valorRepository.findByFaseId( fase.getId() ).stream()
                       .filter( existente -> existente.getAtributo().getId().equals( atributo.getId() ) )
                       .findFirst()
                       .ifPresentOrElse( existente -> {
                           existente.setValor( valor );
                           valorRepository.save( existente );
                       }, () -> valorRepository.save( new ValorAtributoFase( fase, atributo, valor ) ) );
    }
}
