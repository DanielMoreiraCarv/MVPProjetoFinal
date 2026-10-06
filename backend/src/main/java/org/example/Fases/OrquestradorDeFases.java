package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.Fase;
import org.example.Models.Equipe;
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
     * as equipes inscritas na competição, todos na posição 1, porque ainda não
     * houve nada que os ordenasse.
     */
    public List<Classificado> entradaDe ( Fase fase )
    {
        return faseRepository.findByFaseSucessoraId( fase.getId() )
                             .map( this::classificadosDe )
                             .orElseGet( () -> timesInscritos( fase ) );
    }

    /**
     * Só quem avança: a quantidade de classificados era gravada e ignorada, e
     * a fase seguinte recebia a classificação inteira da anterior. Sem
     * quantidade informada, todos seguem.
     */
    private List<Classificado> classificadosDe ( Fase anterior )
    {
        List<Classificado> classificacao = classificacaoDe( anterior );
        Integer quantos = anterior.getQuantidadeClassificados();

        return quantos == null || quantos <= 0 || quantos >= classificacao.size()
                ? classificacao
                : classificacao.subList( 0, quantos );
    }

    private List<Classificado> timesInscritos ( Fase fase )
    {
        if ( fase.getCompeticao() == null || fase.getCompeticao().getLstEquipes() == null )
        {
            return Collections.emptyList();
        }

        List<Classificado> entrada = new ArrayList<>();
        for ( Equipe equipe : fase.getCompeticao().getLstEquipes() )
        {
            entrada.add( new Classificado( 1, equipe.getId() ) );
        }
        return entrada;
    }

    public ResultadoDaValidacao validar ( Fase fase )
    {
        EstrategiaDeFase estrategia = registro.para( fase.getFasePartida() );
        ConfiguracaoDaFase configuracao = configuracaoDe( fase );
        List<Classificado> entrada = entradaDe( fase );

        // Antes de a anterior terminar não há quem entre, e "precisa de ao
        // menos 2 equipes, recebeu 0" não diz o que fazer.
        var anterior = faseRepository.findByFaseSucessoraId( fase.getId() );
        if ( entrada.isEmpty() && anterior.isPresent() )
        {
            return conferirObrigatorios( fase, configuracao ).mais( new ResultadoDaValidacao( List.of(
                    "As equipes desta fase saem de " + anterior.get().getNome()
                            + ", que ainda não tem classificação. Gere e jogue os confrontos dela primeiro." ) ) );
        }

        ResultadoDaValidacao obrigatorios = conferirObrigatorios( fase, configuracao );
        ResultadoDaValidacao empates = conferirEmpates( estrategia, configuracao, entrada );

        return obrigatorios.mais( empates ).mais( estrategia.validar( configuracao, entrada ) );
    }

    private ResultadoDaValidacao conferirObrigatorios ( Fase fase, ConfiguracaoDaFase configuracao )
    {
        List<String> faltando = new ArrayList<>();

        for ( AtributoFase atributo : atributoRepository.findByTipoFase( fase.getFasePartida() ) )
        {
            if ( atributo.isObrigatorio() && !configuracao.informado( atributo.getCodigo() ) )
            {
                faltando.add( "Falta preencher: " + atributo.getDescricao() );
            }
        }

        return new ResultadoDaValidacao( faltando );
    }

    private ResultadoDaValidacao conferirEmpates ( EstrategiaDeFase estrategia,
            ConfiguracaoDaFase configuracao, List<Classificado> entrada )
    {
        if ( estrategia.aceitaEmpateNaEntrada( configuracao ) )
        {
            return ResultadoDaValidacao.valido();
        }

        long distintas = entrada.stream().map( Classificado::posicao ).distinct().count();

        if ( distintas < entrada.size() )
        {
            return ResultadoDaValidacao.com( "As equipes que entram estão empatadas — numa primeira fase"
                    + " ninguém tem classificação ainda —, e o chaveamento precisa de uma ordem. Ative"
                    + " \"Aceitar empates na entrada\" nas regras para chavear pela ordem de inscrição." );
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

    /** A tabela de pontos da fase; vazia na eliminatória, que não se decide por pontos. */
    public List<LinhaDaTabela> tabelaDe ( Fase fase )
    {
        EstrategiaDeFase estrategia = registro.para( fase.getFasePartida() );
        return estrategia.tabela( fase, configuracaoDe( fase ), entradaDe( fase ) );
    }

    public boolean temTabelaDePontos ( Fase fase )
    {
        return registro.para( fase.getFasePartida() ).temTabelaDePontos();
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

        var existente = valorRepository.findByFaseId( fase.getId() ).stream()
                       .filter( valorDele -> valorDele.getAtributo().getId().equals( atributo.getId() ) )
                       .findFirst();

        // Em branco apaga: gravado vazio contava como informado, e trocar o
        // número de grupos pelo tamanho deles caía sempre em "não os dois".
        if ( valor == null || valor.isBlank() )
        {
            existente.ifPresent( valorRepository::delete );
            return;
        }

        existente.ifPresentOrElse( valorDele -> {
                     valorDele.setValor( valor );
                     valorRepository.save( valorDele );
                 }, () -> valorRepository.save( new ValorAtributoFase( fase, atributo, valor ) ) );
    }
}
