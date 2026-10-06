package org.example.Services;

import org.example.Fases.ConfiguracaoDaFase;
import org.example.Fases.OrquestradorDeFases;
import org.example.Fases.RegistroDeEstrategias;
import org.example.Fases.ResultadoDaValidacao;
import org.example.Mapper.FaseMapper;
import org.example.Models.Competicao;
import org.example.Models.Classificado;
import org.example.Models.AtributoFase;
import org.example.Models.EnumFasePartida;
import org.example.Models.Response.AtributoFaseResponse;
import org.example.Mapper.AtributoFaseMapper;
import org.example.Models.Fase;
import org.example.Models.Partida;
import org.example.Models.Request.FaseCreateRequest;
import org.example.Models.Request.FaseUpdateRequest;
import org.example.Models.Response.FaseResponse;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.ValorAtributoFaseRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FaseService
{
    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private CompeticaoService competicaoService;

    @Autowired
    private OrquestradorDeFases orquestrador;

    @Autowired
    private RegistroDeEstrategias registro;

    @Autowired
    private ValorAtributoFaseRepository valorAtributoFaseRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    public FaseResponse criarFase ( FaseCreateRequest request )
    {
        Fase fase = FaseMapper.toEntity( request );

        // O pedido declarava a sucessora e ela era descartada, como já tinha
        // acontecido com a quantidade de classificados.
        if ( request.idFaseSucessora() != null )
        {
            Fase sucessora = buscarFasePorId( request.idFaseSucessora() );
            if ( sucessora == null )
            {
                throw new IllegalArgumentException( "Fase sucessora não encontrada" );
            }
            fase.setFaseSucessora( sucessora );
        }

        return FaseMapper.toResponse( faseRepository.save( fase ) );
    }

    public Fase buscarFasePorId ( Long id )
    {
        return faseRepository.findById( id ).orElse(null);
    }

    public List<Fase> buscarFases (){
        return faseRepository.findAll();
    }

    public List<Fase> buscarFasePorCompeticao ( Long idCompeticao )
    {
        return faseRepository.findFaseByCompeticaoId( idCompeticao ).orElse( null );
    }

    public FaseResponse atualizarFase ( FaseUpdateRequest request, Fase fase )
    {
        if(request!=null && fase!=null){
            fase.setNome( request.nome() );
            fase.setOrdem( request.ordem() );
            fase.setFasePartida(  request.fasePartida() );

            Competicao competicao = competicaoService.buscarPorId( request.idCompeticao() );
            if(competicao==null){
                throw new IllegalArgumentException("Competicao precisa ser informado");
            }
            fase.setCompeticao( competicao );

            fase.setQuantidadeClassificados( request.qtdClassificados() );

            // Sucessora nula desencadeia: antes o `if` só permitia trocar o
            // vínculo, nunca removê-lo, e uma fase encadeada por engano ficava
            // impossível de apagar pelos dois lados.
            if(request.idFaseSucessora()!=null){
                Fase sucessoro =  buscarFasePorId( request.idFaseSucessora() );
                if(sucessoro==null){
                    throw new IllegalArgumentException("Fase sucessora não encontrada");
                }
                fase.setFaseSucessora( sucessoro );
            }
            else {
                fase.setFaseSucessora( null );
            }
        }

        return FaseMapper.toResponse( faseRepository.save( fase ) );
    }

    /**
     * Apaga a fase e o que só existe por causa dela.
     *
     * Os valores de atributo referenciam a fase, então apagá-la sem apagá-los
     * antes violava a chave estrangeira — e o erro chegava como conflito
     * genérico, sem dizer o que estava segurando.
     */
    @Transactional
    public void deleteFase ( Fase fase )
    {
        // Quem apontava para ela passa a não levar a lugar nenhum: sem isso a
        // exclusão da fase seguinte estourava a chave estrangeira, e a tela só
        // podia dizer "conflita com um vínculo em uso".
        faseRepository.findByFaseSucessoraId( fase.getId() ).ifPresent( anterior -> {
            anterior.setFaseSucessora( null );
            faseRepository.save( anterior );
        } );
        valorAtributoFaseRepository.deleteByFaseId( fase.getId() );
        partidaRepository.deleteAll( partidaRepository.findByFaseId( fase.getId() ) );
        faseRepository.delete( fase );
    }

    /** Confere se a fase tem o que precisa, na configuração e na entrada, para ser gerada. */
    public ResultadoDaValidacao validarConfrontos ( Fase fase )
    {
        return orquestrador.validar( fase );
    }

    /** Gera os confrontos da fase a partir do zero, substituindo os que já existiam. */
    public List<Partida> gerarConfrontos ( Fase fase )
    {
        orquestrador.configurar( fase );
        return partidaRepository.findByFaseId( fase.getId() );
    }

    /** Recalcula os confrontos a partir dos resultados já registrados, sem apagar o que já existe. */
    public List<Partida> atualizarConfrontos ( Fase fase, Map<String, String> opcoes )
    {
        orquestrador.atualizar( fase, opcoes );
        return partidaRepository.findByFaseId( fase.getId() );
    }

    public List<org.example.Fases.LinhaDaTabela> tabelaDe ( Fase fase )
    {
        if ( !orquestrador.temTabelaDePontos( fase ) )
        {
            throw new IllegalArgumentException( "A fase " + fase.getNome()
                    + " é eliminatória: não tem tabela de pontos, só a ordem de classificação." );
        }
        return orquestrador.tabelaDe( fase );
    }

    /** A resposta da fase com as contagens que só o orquestrador sabe fazer. */
    public FaseResponse comContagens ( Fase fase )
    {
        FaseResponse base = FaseMapper.toResponse( fase );
        Integer entram = null;
        Integer avancam = null;
        if ( fase.getFasePartida() != null )
        {
            entram = orquestrador.quantosEntram( fase );
            avancam = orquestrador.quantosAvancam( fase );
        }
        return new FaseResponse( base.id(), base.nome(), base.ordem(), base.fasePartida(),
                base.qtdClassificados(), base.idFaseSucessora(), entram, avancam );
    }

    public org.example.Fases.Chaveamento chaveamentoDe ( Fase fase )
    {
        return orquestrador.chaveamentoDe( fase );
    }

    public List<Classificado> classificacaoDe ( Fase fase )
    {
        return orquestrador.classificacaoDe( fase );
    }

    /** O catálogo que a estratégia do tipo declara. */
    public List<AtributoFase> atributosDoTipo ( EnumFasePartida tipoFase )
    {
        if ( !registro.conhece( tipoFase ) )
        {
            throw new IllegalArgumentException(
                    "Não há estratégia registrada para o tipo de fase " + tipoFase + "." );
        }
        return registro.para( tipoFase ).atributosSuportados();
    }

    /** O catálogo do tipo desta fase, com o valor gravado em cada campo. */
    public List<AtributoFaseResponse> atributosDaFase ( Fase fase )
    {
        ConfiguracaoDaFase configuracao = orquestrador.configuracaoDe( fase );

        return atributosDoTipo( fase.getFasePartida() ).stream()
                .map( atributo -> AtributoFaseMapper.toResponse( atributo,
                        configuracao.texto( atributo.getCodigo() ) ) )
                .toList();
    }

    public void definirAtributo ( Fase fase, String codigo, String valor )
    {
        orquestrador.definirAtributo( fase, codigo, valor );
    }
}
