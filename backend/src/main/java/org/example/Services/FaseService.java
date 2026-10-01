package org.example.Services;

import org.example.Fases.OrquestradorDeFases;
import org.example.Fases.ResultadoDaValidacao;
import org.example.Mapper.FaseMapper;
import org.example.Models.AtributoFase;
import org.example.Models.Campeonato;
import org.example.Models.Classificado;
import org.example.Models.EnumTipoDeDado;
import org.example.Models.Fase;
import org.example.Models.Partida;
import org.example.Models.Request.FaseCreateRequest;
import org.example.Models.Request.FaseUpdateRequest;
import org.example.Models.Response.AtributoFaseResponse;
import org.example.Models.Response.FaseResponse;
import org.example.Repositories.AtributoFaseRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.PartidaRepository;
import org.example.Repositories.ValorAtributoFaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FaseService
{
    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private CampeonatoService campeonatoService;

    @Autowired
    private OrquestradorDeFases orquestrador;

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private AtributoFaseRepository atributoRepository;

    @Autowired
    private ValorAtributoFaseRepository valorAtributoRepository;

    public FaseResponse criarFase ( FaseCreateRequest request )
    {
        Fase fase = FaseMapper.toEntity( request );
        return FaseMapper.toResponse( faseRepository.save( fase ) );
    }

    public Fase buscarFasePorId ( Long id )
    {
        return faseRepository.findById( id ).orElse(null);
    }

    public List<Fase> buscarFases (){
        return faseRepository.findAll();
    }

    public List<Fase> buscarFasePorCampeonato ( Long idCampeonato )
    {
        return faseRepository.findFaseByCampeonatoId( idCampeonato ).orElse( null );
    }

    public FaseResponse atualizarFase ( FaseUpdateRequest request, Fase fase )
    {
        if(request!=null && fase!=null){
            fase.setNome( request.nome() );
            fase.setOrdem( request.ordem() );
            fase.setFasePartida(  request.fasePartida() );

            Campeonato campeonato = campeonatoService.buscarPorId( request.idCampeonato() );
            if(campeonato==null){
                throw new IllegalArgumentException("Campeonato precisa ser informado");
            }
            fase.setCampeonato( campeonato );

            if(request.idFaseSucessora()!=null){
                Fase sucessoro =  buscarFasePorId( request.idFaseSucessora() );
                if(sucessoro==null){
                    throw new IllegalArgumentException("Fase sucessora não encontrada");
                }
                fase.setFaseSucessora( sucessoro );
            }

        }

        return FaseMapper.toResponse( faseRepository.save( fase ) );
    }

    public void deleteFase ( Fase fase )
    {
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

    public List<Classificado> classificacaoDe ( Fase fase )
    {
        return orquestrador.classificacaoDe( fase );
    }

    /** Os atributos que o tipo da fase aceita, com o valor configurado nesta fase. */
    public List<AtributoFaseResponse> atributosDe ( Fase fase )
    {
        exigirTipo( fase );

        Map<Long, String> valores = new HashMap<>();
        valorAtributoRepository.findByFaseId( fase.getId() )
                               .forEach( v -> valores.put( v.getAtributo().getId(), v.getValor() ) );

        return atributoRepository.findByTipoFase( fase.getFasePartida() ).stream()
                .map( atributo -> new AtributoFaseResponse( atributo.getCodigo(),
                        atributo.getTipoDado(), atributo.isObrigatorio(), atributo.getValorPadrao(),
                        atributo.getDescricao(), valores.get( atributo.getId() ) ) )
                .toList();
    }

    /**
     * Grava os valores informados. Confere todos antes de gravar qualquer um: um
     * atributo desconhecido ou com tipo errado recusa a requisição inteira.
     * Valor null apaga a configuração, e o atributo volta a valer o padrão.
     */
    @Transactional
    public List<AtributoFaseResponse> definirAtributos ( Fase fase, Map<String, String> valores )
    {
        exigirTipo( fase );

        if ( valores == null || valores.isEmpty() )
        {
            throw new IllegalArgumentException( "informe ao menos um atributo" );
        }

        Map<String, AtributoFase> aceitos = new HashMap<>();
        atributoRepository.findByTipoFase( fase.getFasePartida() )
                          .forEach( atributo -> aceitos.put( atributo.getCodigo(), atributo ) );

        List<String> erros = new ArrayList<>();
        valores.forEach( ( codigo, valor ) -> {
            AtributoFase atributo = aceitos.get( codigo );
            if ( atributo == null )
            {
                erros.add( "a fase " + fase.getFasePartida() + " não aceita o atributo " + codigo );
            }
            else if ( valor != null && !tipoValido( atributo.getTipoDado(), valor ) )
            {
                erros.add( "atributo " + codigo + " espera " + atributo.getTipoDado() + ", veio: " + valor );
            }
        } );

        if ( !erros.isEmpty() )
        {
            throw new IllegalArgumentException( String.join( "; ", erros ) );
        }

        valores.forEach( ( codigo, valor ) -> orquestrador.definirAtributo( fase, codigo, valor ) );

        return atributosDe( fase );
    }

    private void exigirTipo ( Fase fase )
    {
        if ( fase.getFasePartida() == null )
        {
            throw new IllegalArgumentException( "a fase não tem tipo definido" );
        }
    }

    private boolean tipoValido ( EnumTipoDeDado tipo, String valor )
    {
        String limpo = valor.trim();
        return switch ( tipo )
        {
            case INTEIRO -> limpo.matches( "-?\\d+" );
            case BOOLEANO -> limpo.equalsIgnoreCase( "true" ) || limpo.equalsIgnoreCase( "false" );
            case TEXTO, LISTA_DE_TEXTO -> true;
        };
    }
}
