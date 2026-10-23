package org.example.Seguranca;

import org.example.Seguranca.Acesso.Recurso;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * A tabela única de "este id é de quê". O caminho, a query e o corpo dos
 * pedidos são conferidos por ela.
 *
 * Falha fechada: um nome que parece id e não está aqui derruba o pedido com
 * erro, em vez de passar sem conferência. Uma rota nova com um id novo quebra
 * nos testes antes de virar vazamento.
 */
public final class MapaDaPorta
{
    private static final String PREFIXO = "/api/v1/";

    /** Fora da porta: o acompanhamento (que tem a própria), a sessão e o que é só da plataforma. */
    private static final Set<String> FORA = Set.of("publico", "auth", "usuario", "papel", "modalidade");

    /** O `{id}` da rota é do recurso do primeiro trecho do caminho. */
    private static final Map<String, Recurso> POR_TRECHO = Map.ofEntries(
            Map.entry("competicao", Recurso.COMPETICAO),
            Map.entry("partida", Recurso.PARTIDA),
            Map.entry("fase", Recurso.FASE),
            Map.entry("sumula", Recurso.SUMULA),
            Map.entry("sancao", Recurso.SANCAO),
            Map.entry("sancao_atleta", Recurso.SANCAO_ATLETA),
            Map.entry("equipe", Recurso.EQUIPE),
            Map.entry("atleta", Recurso.ATLETA),
            Map.entry("arbitro", Recurso.ARBITRO),
            Map.entry("federacao", Recurso.FEDERACAO),
            Map.entry("administracao", Recurso.ADMINISTRACAO),
            Map.entry("tabela", Recurso.SO_PLATAFORMA));

    private static final Map<String, Recurso> POR_NOME = Map.ofEntries(
            Map.entry("idCompeticao", Recurso.COMPETICAO),
            Map.entry("idPartida", Recurso.PARTIDA),
            Map.entry("idFase", Recurso.FASE),
            Map.entry("idFaseSucessora", Recurso.FASE),
            Map.entry("idEvento", Recurso.EVENTO),
            Map.entry("idSancao", Recurso.SANCAO),
            Map.entry("idEquipe", Recurso.EQUIPE),
            Map.entry("idEquipeMandante", Recurso.EQUIPE),
            Map.entry("idEquipeVisitante", Recurso.EQUIPE),
            Map.entry("equipesIds", Recurso.EQUIPE),
            Map.entry("idAtleta", Recurso.ATLETA),
            Map.entry("idArbitro", Recurso.ARBITRO),
            Map.entry("idFederacao", Recurso.FEDERACAO),
            Map.entry("idAdministracao", Recurso.ADMINISTRACAO));

    /**
     * Ids que só fazem sentido dentro do recurso já conferido no caminho, e
     * que o serviço confere que pertencem a ele: a pessoa e o convite de uma
     * competição, o atributo de uma fase.
     */
    private static final Set<String> CONFERIDOS_PELO_SERVICO = Set.of("idUsuario", "idConvite", "codigo");

    /** Ids de catálogo comum a todas as contas. */
    private static final Set<String> GLOBAIS = Set.of("idModalidade", "modalidadesIds");

    private static final Pattern PARECE_ID = Pattern.compile("^id$|^id[A-Z].*|.*Ids?$");

    private MapaDaPorta()
    {
    }

    public static boolean aplica(String caminho)
    {
        return caminho.startsWith(PREFIXO) && !FORA.contains(trecho(caminho));
    }

    public static String trecho(String caminho)
    {
        String resto = caminho.substring(Math.min(PREFIXO.length(), caminho.length()));
        int barra = resto.indexOf('/');
        return barra < 0 ? resto : resto.substring(0, barra);
    }

    public static boolean pareceId(String nome)
    {
        return PARECE_ID.matcher(nome).matches();
    }

    /**
     * O recurso de um id, ou vazio para id de catálogo global. Lança para
     * nome que parece id e não tem regra.
     */
    public static Optional<Recurso> recursoDe(String nome, String caminho)
    {
        if (GLOBAIS.contains(nome) || CONFERIDOS_PELO_SERVICO.contains(nome))
        {
            return Optional.empty();
        }

        Recurso recurso = "id".equals(nome) ? POR_TRECHO.get(trecho(caminho)) : POR_NOME.get(nome);
        if (recurso == null)
        {
            throw new IllegalStateException("A porta não tem regra para o id '" + nome + "' em " + caminho);
        }
        return Optional.of(recurso);
    }

    public static Optional<Recurso> recursoDoTrecho(String caminho)
    {
        return Optional.ofNullable(POR_TRECHO.get(trecho(caminho)));
    }
}
