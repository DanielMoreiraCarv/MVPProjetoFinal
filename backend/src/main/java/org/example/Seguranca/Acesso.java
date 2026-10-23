package org.example.Seguranca;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.Exception.NaoEncontradoException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Quem enxerga o quê.
 *
 * A competição é a unidade de compartilhamento: quem participa dela pode tudo
 * dentro dela. O que vive fora da competição — administração, equipe,
 * atleta, árbitro, federação — é visto pelo dono e por quem participa de uma
 * competição em que aquilo aparece. Enxergar é poder editar: não há níveis
 * entre participantes.
 *
 * A administração da plataforma enxerga tudo. Sem usuário identificado, nada:
 * a porta falha fechada.
 */
@Component
public class Acesso
{
    public enum Recurso
    {
        COMPETICAO, PARTIDA, FASE, SUMULA, EVENTO, SANCAO, SANCAO_ATLETA,
        EQUIPE, ATLETA, ARBITRO, FEDERACAO, ADMINISTRACAO,
        /** O cálculo antigo de tabela, sem dono nem competição: só a plataforma. */
        SO_PLATAFORMA
    }

    private static final String CHAVE_NA_REQUISICAO = Acesso.class.getName() + ".visiveis";

    @PersistenceContext
    private EntityManager em;

    /** O que o usuário enxerga, calculado uma vez por requisição. */
    private record Visiveis(Set<Long> competicoes, Set<Long> equipes, Set<Long> atletas,
                            Set<Long> arbitros, Set<Long> federacoes, Set<Long> administracoes)
    {
    }

    public boolean irrestrito()
    {
        return UsuarioCorrente.daPlataforma();
    }

    public boolean enxerga(Recurso recurso, Long id)
    {
        if (id == null)
        {
            return true;
        }
        if (irrestrito())
        {
            return true;
        }

        Visiveis visiveis = visiveis();
        return switch (recurso)
        {
            case COMPETICAO -> visiveis.competicoes().contains(id);
            case EQUIPE -> visiveis.equipes().contains(id);
            case ATLETA -> visiveis.atletas().contains(id);
            case ARBITRO -> visiveis.arbitros().contains(id);
            case FEDERACAO -> visiveis.federacoes().contains(id);
            case ADMINISTRACAO -> visiveis.administracoes().contains(id);
            case PARTIDA, FASE, SUMULA, EVENTO, SANCAO, SANCAO_ATLETA ->
                    competicaoDe(recurso, id).map(visiveis.competicoes()::contains).orElse(false);
            case SO_PLATAFORMA -> false;
        };
    }

    /**
     * Recusa com "não encontrado", e não "proibido": a resposta não confirma
     * que existe algo de outra conta com aquele id.
     */
    public void exigir(Recurso recurso, Long id)
    {
        if (!enxerga(recurso, id))
        {
            throw NaoEncontradoException.de(nomeDe(recurso), id);
        }
    }

    public Optional<Long> idDoUsuario()
    {
        return UsuarioCorrente.id();
    }

    private Optional<Long> competicaoDe(Recurso recurso, Long id)
    {
        String consulta = switch (recurso)
        {
            case PARTIDA -> "select p.competicao.id from Partida p where p.id = :id";
            case FASE -> "select f.competicao.id from Fase f where f.id = :id";
            case SUMULA -> "select s.partida.competicao.id from Sumula s where s.id = :id";
            case EVENTO -> "select e.sumula.partida.competicao.id from EventoDaSumula e where e.id = :id";
            case SANCAO -> "select s.competicao.id from Sancao s where s.id = :id";
            case SANCAO_ATLETA -> "select s.sancao.competicao.id from SancaoAtleta s where s.id = :id";
            default -> throw new IllegalArgumentException("Sem competição: " + recurso);
        };
        // Lista, e não stream: a porta roda fora de transação, e o cursor de um
        // stream fecha antes de ser lido (500 em produção, invisível nos testes,
        // que rodam dentro de uma transação).
        return em.createQuery(consulta, Long.class).setParameter("id", id).setMaxResults(1)
                .getResultList().stream().findFirst();
    }

    private Visiveis visiveis()
    {
        RequestAttributes requisicao = RequestContextHolder.getRequestAttributes();
        if (requisicao != null
                && requisicao.getAttribute(CHAVE_NA_REQUISICAO, RequestAttributes.SCOPE_REQUEST) instanceof Visiveis guardado)
        {
            return guardado;
        }

        Visiveis calculado = idDoUsuario().map(this::calcular).orElseGet(() ->
                new Visiveis(Set.of(), Set.of(), Set.of(), Set.of(), Set.of(), Set.of()));

        if (requisicao != null)
        {
            requisicao.setAttribute(CHAVE_NA_REQUISICAO, calculado, RequestAttributes.SCOPE_REQUEST);
        }
        return calculado;
    }

    private Visiveis calcular(Long usuario)
    {
        Set<Long> competicoes = ids("select c.id from Competicao c join c.participantes p where p = :valor", usuario);

        Set<Long> equipes = ids("select e.id from Equipe e where e.donoId = :valor", usuario);
        equipes.addAll(idsEm("select e.id from Competicao c join c.lstEquipes e where c.id in :valor", competicoes));

        Set<Long> atletas = ids("select a.id from Atleta a where a.donoId = :valor", usuario);
        atletas.addAll(idsEm("select a.id from Atleta a where a.equipe.id in :valor", equipes));

        Set<Long> arbitros = ids("select a.id from Arbitro a where a.donoId = :valor", usuario);
        arbitros.addAll(idsEm("select p.arbitro.id from Partida p where p.competicao.id in :valor", competicoes));
        arbitros.addAll(idsEm("select s.arbitro.id from Sumula s where s.partida.competicao.id in :valor", competicoes));

        Set<Long> federacoes = ids("select f.id from Federacao f where f.donoId = :valor", usuario);
        federacoes.addAll(idsEm("select e.federacao.id from Equipe e where e.id in :valor", equipes));

        Set<Long> administracoes = ids("select a.id from Administracao a where a.donoId = :valor", usuario);
        administracoes.addAll(idsEm("select c.administracao.id from Competicao c where c.id in :valor", competicoes));

        return new Visiveis(competicoes, equipes, atletas, arbitros, federacoes, administracoes);
    }

    private Set<Long> ids(String consulta, Long valor)
    {
        return new HashSet<>(em.createQuery(consulta, Long.class).setParameter("valor", valor).getResultList());
    }

    private Set<Long> idsEm(String consulta, Collection<Long> valores)
    {
        if (valores.isEmpty())
        {
            return new HashSet<>();
        }
        List<Long> encontrados = em.createQuery(consulta, Long.class).setParameter("valor", valores).getResultList();
        Set<Long> semNulos = new HashSet<>(encontrados);
        semNulos.remove(null);
        return semNulos;
    }

    private static String nomeDe(Recurso recurso)
    {
        return switch (recurso)
        {
            case COMPETICAO -> "Competição";
            case PARTIDA -> "Partida";
            case FASE -> "Fase";
            case SUMULA -> "Súmula";
            case EVENTO -> "Lançamento";
            case SANCAO -> "Sanção";
            case SANCAO_ATLETA -> "Sanção";
            case EQUIPE -> "Equipe";
            case ATLETA -> "Atleta";
            case ARBITRO -> "Árbitro";
            case FEDERACAO -> "Federação";
            case ADMINISTRACAO -> "Administração";
            case SO_PLATAFORMA -> "Recurso";
        };
    }
}
