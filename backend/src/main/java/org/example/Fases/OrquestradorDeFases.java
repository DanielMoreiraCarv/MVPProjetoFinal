package org.example.Fases;

import org.example.Models.AtributoFase;
import org.example.Models.Classificado;
import org.example.Models.Fase;
import org.example.Models.Equipe;
import org.example.Models.ValorAtributoFase;
import org.example.Repositories.AtributoFaseRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.ValorAtributoFaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
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
    private final PartidaRepository partidaRepository;

    public OrquestradorDeFases ( RegistroDeEstrategias registro, FaseRepository faseRepository,
            AtributoFaseRepository atributoRepository,
            ValorAtributoFaseRepository valorRepository,
            PartidaRepository partidaRepository )
    {
        this.partidaRepository = partidaRepository;
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
                             .map( anterior -> terminou( anterior ) ? classificadosDe( anterior )
                                     : List.<Classificado>of() )
                             .orElseGet( () -> timesInscritos( fase ) );
    }

    /**
     * Só entra na fase seguinte quem se classificou de fato. Antes disso a
     * classificação da anterior é provisória — com os confrontos gerados e
     * ninguém jogando, os primeiros de uma tabela toda zerada —, e era ela
     * que virava a entrada: dava para gerar o mata-mata antes dos grupos.
     */
    private boolean terminou ( Fase fase )
    {
        List<org.example.Models.Partida> partidas = partidaRepository.findByFaseId( fase.getId() );
        return !partidas.isEmpty() && partidas.stream().allMatch( org.example.Models.Partida::isRealizada );
    }

    /** Quantas equipes a fase vai receber, mesmo antes de saber quais. */
    private int participantesPrevistos ( Fase fase, int profundidade )
    {
        return faseRepository.findByFaseSucessoraId( fase.getId() )
                             .map( anterior -> profundidade > 20 ? 0 : avancam( anterior, profundidade + 1 ) )
                             .orElseGet( () -> timesInscritos( fase ).size() );
    }

    private int avancam ( Fase fase, int profundidade )
    {
        int entram = participantesPrevistos( fase, profundidade );
        if ( fase.getQuantidadeClassificados() != null )
        {
            return fase.getQuantidadeClassificados();
        }
        Integer padrao = registro.para( fase.getFasePartida() )
                                 .quantosAvancamPorPadrao( configuracaoDe( fase ), entram );
        return padrao != null ? padrao : entram;
    }

    /** Quantas equipes entram na fase — sabido antes de saber quais. */
    public int quantosEntram ( Fase fase )
    {
        return participantesPrevistos( fase, 0 );
    }

    /**
     * Quantas avançam: o total da fase, quando informado; senão o que o
     * formato diz — na fase de grupos, grupos vezes os que avançam por grupo.
     */
    public int quantosAvancam ( Fase fase )
    {
        return avancam( fase, 0 );
    }

    /**
     * Só quem avança: a quantidade de classificados era gravada e ignorada, e
     * a fase seguinte recebia a classificação inteira da anterior. Sem
     * quantidade informada, todos seguem.
     */
    private List<Classificado> classificadosDe ( Fase anterior )
    {
        List<Classificado> classificacao = classificacaoDe( anterior );
        // A classificação da fase de grupos já vem por colocação — os
        // primeiros, depois os segundos, cada leva ordenada pelos critérios —,
        // então cortar no total é "os primeiros e os melhores segundos".
        int quantos = quantosAvancam( anterior );

        return quantos <= 0 || quantos >= classificacao.size()
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

    /**
     * A fase validada com a entrada que ela vai ter, antes de saber quem:
     * na primeira, as inscritas; nas seguintes, tantas quantas a anterior faz
     * avançar, já em ordem. É o que deixa reprovar, antes de gerar qualquer
     * partida, uma eliminatória que vai receber 24 equipes.
     */
    public ResultadoDaValidacao validarPrevista ( Fase fase )
    {
        if ( faseRepository.findByFaseSucessoraId( fase.getId() ).isEmpty() )
        {
            return validar( fase );
        }

        EstrategiaDeFase estrategia = registro.para( fase.getFasePartida() );
        ConfiguracaoDaFase configuracao = configuracaoDe( fase );
        int entram = quantosEntram( fase );
        List<Classificado> prevista = new ArrayList<>();
        for ( int i = 1; i <= entram; i++ )
        {
            // Equipes que ainda não se sabe quem são: o que importa para a
            // validação é quantas são e que chegam em ordem.
            prevista.add( new Classificado( i, -(long) i ) );
        }

        ResultadoDaValidacao resultado = conferirObrigatorios( fase, configuracao );
        if ( fase.getQuantidadeClassificados() != null && fase.getQuantidadeClassificados() > entram )
        {
            resultado = resultado.mais( ResultadoDaValidacao.com( "Avançam " + fase.getQuantidadeClassificados()
                    + ", mas entram só " + entram + " equipes nesta fase." ) );
        }
        return resultado.mais( estrategia.validar( configuracao, prevista ) );
    }

    /**
     * A estrutura inteira, fase a fase, na ordem da competição. Além do que
     * cada fase exige, confere o encadeamento: uma fase que não é a primeira e
     * não recebe de ninguém ficaria sem equipes para sempre.
     */
    public List<ValidacaoDaFase> validarEstrutura ( List<Fase> fases )
    {
        List<Fase> emOrdem = fases.stream()
                .sorted( Comparator.comparing( ( Fase f ) -> f.getOrdem() == null ? 0 : f.getOrdem() )
                        .thenComparing( Fase::getId ) )
                .toList();
        List<ValidacaoDaFase> resultado = new ArrayList<>();

        for ( int i = 0; i < emOrdem.size(); i++ )
        {
            Fase fase = emOrdem.get( i );
            ResultadoDaValidacao daFase = validarPrevista( fase );
            if ( i > 0 && faseRepository.findByFaseSucessoraId( fase.getId() ).isEmpty() )
            {
                daFase = daFase.mais( ResultadoDaValidacao.com( "Esta fase não recebe equipes de nenhuma outra."
                        + " Escolha de qual fase ela recebe os classificados." ) );
            }
            resultado.add( new ValidacaoDaFase( fase, daFase ) );
        }
        return resultado;
    }

    /**
     * Fase acabou: a seguinte é montada sozinha, se ainda não foi e se puder.
     * Antes alguém precisava gerar os confrontos dela à mão, fase por fase.
     */
    public void avancarSeTerminou ( Fase fase )
    {
        Fase seguinte = fase.getFaseSucessora();
        if ( seguinte == null || !terminou( fase ) || !partidaRepository.findByFaseId( seguinte.getId() ).isEmpty() )
        {
            return;
        }
        if ( validar( seguinte ).ehValido() )
        {
            configurar( seguinte );
        }
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
                            + ", que ainda não terminou. Os classificados entram quando todos os jogos dela forem encerrados." ) ) );
        }

        if ( fase.getQuantidadeClassificados() != null && !entrada.isEmpty()
                && fase.getQuantidadeClassificados() > entrada.size() )
        {
            return conferirObrigatorios( fase, configuracao ).mais( new ResultadoDaValidacao( List.of(
                    "Avançam " + fase.getQuantidadeClassificados() + ", mas entram só " + entrada.size()
                            + " equipes nesta fase." ) ) );
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

    /** A chave da eliminatória; as outras fases não têm. */
    public Chaveamento chaveamentoDe ( Fase fase )
    {
        if ( !( registro.para( fase.getFasePartida() ) instanceof EstrategiaDeMataMata mataMata ) )
        {
            throw new IllegalArgumentException( "A fase " + fase.getNome()
                    + " não é eliminatória: ela tem tabela de pontos, não chave." );
        }
        return mataMata.chaveamento( fase, configuracaoDe( fase ), entradaDe( fase ),
                participantesPrevistos( fase, 0 ) );
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
