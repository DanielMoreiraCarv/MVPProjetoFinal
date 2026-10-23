package org.example.Seguranca;

import org.example.Models.Response.AdministracaoResponse;
import org.example.Models.Response.ArbitroResponse;
import org.example.Models.Response.AtletaResponse;
import org.example.Models.Response.AtributoFaseResponse;
import org.example.Models.Response.ClassificadoResponse;
import org.example.Models.Response.CompeticaoResponse;
import org.example.Models.Response.EquipeResponse;
import org.example.Models.Response.EquipeResumoResponse;
import org.example.Models.Response.EventoDaSumulaResponse;
import org.example.Models.Response.FaseResponse;
import org.example.Models.Response.FederacaoResponse;
import org.example.Models.Response.LinhaDaTabelaResponse;
import org.example.Models.Response.ModalidadeResponse;
import org.example.Models.Response.PartidaResponse;
import org.example.Models.Response.SancaoAtletaResponse;
import org.example.Models.Response.SancaoResponse;
import org.example.Models.Response.SumulaResponse;
import org.example.Seguranca.Acesso.Recurso;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

/**
 * Tira de toda lista devolvida o que a pessoa não enxerga. Na resposta, e
 * não rota a rota: `GET /partida/equipe/{id}` de uma equipe compartilhada
 * listaria também os jogos dela em competições privadas do dono.
 *
 * Lista de um tipo que a tabela não conhece derruba o pedido com erro — um
 * endpoint novo não sai devolvendo tudo por esquecimento.
 */
@ControllerAdvice
public class FiltroDeListas implements ResponseBodyAdvice<Object>
{
    private record Regra(Recurso recurso, Function<Object, Long> id)
    {
    }

    private static final Map<Class<?>, Regra> REGRAS = Map.ofEntries(
            regra(CompeticaoResponse.class, Recurso.COMPETICAO, CompeticaoResponse::id),
            regra(PartidaResponse.class, Recurso.PARTIDA, PartidaResponse::id),
            regra(FaseResponse.class, Recurso.FASE, FaseResponse::id),
            regra(SumulaResponse.class, Recurso.SUMULA, SumulaResponse::id),
            regra(EventoDaSumulaResponse.class, Recurso.EVENTO, EventoDaSumulaResponse::id),
            regra(SancaoResponse.class, Recurso.SANCAO, SancaoResponse::id),
            regra(SancaoAtletaResponse.class, Recurso.SANCAO_ATLETA, SancaoAtletaResponse::idSancaoAtleta),
            regra(EquipeResponse.class, Recurso.EQUIPE, EquipeResponse::id),
            regra(EquipeResumoResponse.class, Recurso.EQUIPE, EquipeResumoResponse::id),
            regra(AtletaResponse.class, Recurso.ATLETA, AtletaResponse::id),
            regra(ArbitroResponse.class, Recurso.ARBITRO, ArbitroResponse::id),
            regra(FederacaoResponse.class, Recurso.FEDERACAO, FederacaoResponse::id),
            regra(AdministracaoResponse.class, Recurso.ADMINISTRACAO, AdministracaoResponse::id));

    /** Itens que não são de ninguém: catálogos e linhas calculadas de uma fase já conferida. */
    private static final Set<Class<?>> NEUTROS = Set.of(
            ModalidadeResponse.class, AtributoFaseResponse.class, LinhaDaTabelaResponse.class,
            ClassificadoResponse.class, String.class, Long.class, Integer.class);

    private final Acesso acesso;

    public FiltroDeListas(Acesso acesso)
    {
        this.acesso = acesso;
    }

    @SuppressWarnings("unchecked")
    private static <T> Map.Entry<Class<?>, Regra> regra(Class<T> tipo, Recurso recurso, Function<T, Long> id)
    {
        return Map.entry(tipo, new Regra(recurso, objeto -> id.apply((T) objeto)));
    }

    @Override
    public boolean supports(MethodParameter tipoDeRetorno, Class<? extends HttpMessageConverter<?>> conversor)
    {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object corpo, MethodParameter tipoDeRetorno, MediaType tipoDeMidia,
                                  Class<? extends HttpMessageConverter<?>> conversor,
                                  ServerHttpRequest requisicao, ServerHttpResponse resposta)
    {
        String caminho = requisicao.getURI().getPath();
        if (!(corpo instanceof Collection<?> itens) || !MapaDaPorta.aplica(caminho) || acesso.irrestrito())
        {
            return corpo;
        }

        return itens.stream().filter(item -> visivel(item, caminho)).toList();
    }

    private boolean visivel(Object item, String caminho)
    {
        if (item == null)
        {
            return false;
        }

        Regra regra = REGRAS.get(item.getClass());
        if (regra != null)
        {
            return acesso.enxerga(regra.recurso(), regra.id().apply(item));
        }
        if (NEUTROS.contains(item.getClass()))
        {
            return true;
        }

        throw new IllegalStateException(
                "O filtro de listas não conhece " + item.getClass().getSimpleName() + " em " + caminho);
    }

    /** Para os testes conferirem a cobertura. */
    static List<Class<?>> tiposConhecidos()
    {
        return List.copyOf(REGRAS.keySet());
    }
}
