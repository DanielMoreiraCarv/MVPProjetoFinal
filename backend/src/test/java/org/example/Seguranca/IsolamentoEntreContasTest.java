package org.example.Seguranca;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.Models.Papel;
import org.example.Models.Request.PapelConcedidoRequest;
import org.example.Models.Usuario;
import org.example.Repositories.ModalidadeRepository;
import org.example.Services.UsuarioService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Parameter;
import java.lang.reflect.RecordComponent;
import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Uma conta não enxerga nem mexe no que é de outra.
 *
 * A conta A monta uma competição inteira pela API; a conta B, que não
 * participa dela, tenta cada rota que o Spring tem registrada apontando para
 * os dados de A. As rotas são lidas do próprio Spring, e não de uma lista
 * escrita à mão: uma rota nova entra na varredura sem ninguém lembrar dela.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class IsolamentoEntreContasTest
{
    private static final String SENHA = "senhaForte123";
    private static final String MARCA = "Segredo-A";
    private static final Pattern VARIAVEL = Pattern.compile("\\{(\\w+)}");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping rotas;

    private Usuario contaA;
    private Usuario contaB;
    private final Map<String, Long> deA = new HashMap<>();

    @BeforeAll
    static void exigirBanco()
    {
        try (Socket ignorado = new Socket("localhost", 5433))
        {
            // no ar
        }
        catch (Exception falha)
        {
            throw new IllegalStateException("""
                    Postgres local indisponível em localhost:5433. Suba o ambiente antes de rodar os testes:
                      ./deploy/ambiente.sh subir""");
        }
    }

    @BeforeEach
    void cenario() throws Exception
    {
        contaA = organizador("conta.a@exemplo.com");
        contaB = organizador("conta.b@exemplo.com");
        Long futebol = modalidadeRepository.findByCodigo("FUTEBOL_DE_CAMPO").orElseThrow().getId();

        deA.put("administracao", criar("/administracao", """
                {"nome":"%s Liga","descricao":"x"}""".formatted(MARCA)));
        deA.put("federacao", criar("/federacao", """
                {"nome":"%s Federação"}""".formatted(MARCA)));
        deA.put("arbitro", criar("/arbitro", """
                {"nome":"%s Árbitro","federacao":"x","categoria":"x"}""".formatted(MARCA)));
        deA.put("equipe", criar("/equipe", """
                {"nome":"%s Equipe 1","idModalidade":%d,"idFederacao":%d}"""
                .formatted(MARCA, futebol, deA.get("federacao"))));
        deA.put("equipe2", criar("/equipe", """
                {"nome":"%s Equipe 2","idModalidade":%d}""".formatted(MARCA, futebol)));
        deA.put("equipeFora", criar("/equipe", """
                {"nome":"%s Equipe fora","idModalidade":%d}""".formatted(MARCA, futebol)));
        deA.put("atleta", criar("/atleta", """
                {"nome":"%s Atleta","idade":12,"numCamisa":10,"cpf":"52998224725","idModalidade":%d,"idEquipe":%d}"""
                .formatted(MARCA, futebol, deA.get("equipe"))));
        deA.put("competicao", criar("/competicao", """
                {"nome":"%s Copa","modalidadesIds":[%d],"isMataMata":false,"descricao":"x","categoria":"x","idAdministracao":%d}"""
                .formatted(MARCA, futebol, deA.get("administracao"))));
        deA.put("competicaoPrivada", criar("/competicao", """
                {"nome":"%s Copa só de A","modalidadesIds":[%d],"isMataMata":false,"descricao":"x","categoria":"x"}"""
                .formatted(MARCA, futebol)));

        comoA(post("/api/v1/competicao/{id}/equipe/{idEquipe}", deA.get("competicao"), deA.get("equipe")));
        comoA(post("/api/v1/competicao/{id}/equipe/{idEquipe}", deA.get("competicao"), deA.get("equipe2")));
        comoA(post("/api/v1/competicao/{id}/equipe/{idEquipe}", deA.get("competicaoPrivada"), deA.get("equipeFora")));

        deA.put("partida", criar("/partida", """
                {"idCompeticao":%d,"idEquipeMandante":%d,"idEquipeVisitante":%d,"idArbitro":%d}"""
                .formatted(deA.get("competicao"), deA.get("equipe"), deA.get("equipe2"), deA.get("arbitro"))));
        deA.put("fase", criar("/fase", """
                {"nome":"%s Fase","ordem":1,"fasePartida":"PONTOS_CORRIDOS","idCompeticao":%d}"""
                .formatted(MARCA, deA.get("competicao"))));
        deA.put("sumula", criar("/sumula", """
                {"idPartida":%d,"modo":"COMPLETA"}""".formatted(deA.get("partida"))));
        JsonNode comGol = ler(comoA(post("/api/v1/sumula/{id}/evento", deA.get("sumula"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"idAtleta":%d,"tipo":"GOL"}""".formatted(deA.get("atleta")))));
        deA.put("evento", comGol.get("eventos").get(0).get("id").asLong());
        deA.put("sancao", criar("/sancao", """
                {"qtdPartidas":1,"tipoEsporte":"FUTEBOL","idCompeticao":%d}""".formatted(deA.get("competicao"))));
        deA.put("sancao_atleta", ler(comoA(post("/api/v1/sancao_atleta")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"idSancao":%d,"idAtleta":%d,"idPartida":%d,"justificativa":"x"}"""
                        .formatted(deA.get("sancao"), deA.get("atleta"), deA.get("partida")))))
                .get("idSancaoAtleta").asLong());
        deA.put("convite", ler(comoA(post("/api/v1/competicao/{id}/pessoas", deA.get("competicao"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"ainda.sem.conta@exemplo.com"}""")))
                .get("convites").get(0).get("id").asLong());
    }

    /* ------------------------------------------------------- varredura --- */

    @Test
    void contaBNaoAlcancaNadaDeAPorNenhumaRota() throws Exception
    {
        List<String> falhas = new ArrayList<>();
        List<String> tentadas = new ArrayList<>();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> rota : rotas.getHandlerMethods().entrySet())
        {
            for (String padrao : rota.getKey().getPathPatternsCondition().getPatternValues())
            {
                if (!MapaDaPorta.aplica(padrao))
                {
                    continue;
                }

                Set<RequestMethod> metodos = rota.getKey().getMethodsCondition().getMethods();
                for (RequestMethod metodo : metodos.isEmpty() ? Set.of(RequestMethod.GET) : metodos)
                {
                    boolean comVariaveis = VARIAVEL.matcher(padrao).find();
                    boolean leitura = metodo == RequestMethod.GET;

                    // Criação sem id no caminho é provada nos testes de ids no corpo.
                    if (!comVariaveis && !leitura && !padrao.startsWith("/api/v1/tabela"))
                    {
                        continue;
                    }

                    String url = preencher(padrao);
                    tentadas.add(metodo + " " + padrao);
                    MvcResult resultado = mockMvc.perform(request(HttpMethod.valueOf(metodo.name()), url)
                                    .with(como(contaB))
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("{}"))
                            .andReturn();
                    int codigo = resultado.getResponse().getStatus();
                    String corpo = resultado.getResponse().getContentAsString();

                    if (comVariaveis || padrao.startsWith("/api/v1/tabela"))
                    {
                        if (codigo != 404 && codigo != 403)
                        {
                            falhas.add(metodo + " " + url + " → HTTP " + codigo);
                        }
                    }
                    else if (codigo >= 500 || corpo.contains(MARCA))
                    {
                        falhas.add(metodo + " " + url + " → HTTP " + codigo
                                + (corpo.contains(MARCA) ? " com dado de A na resposta" : ""));
                    }
                }
            }
        }

        // Uma varredura que não tentou nada também "passaria": a contagem prova que ela andou.
        System.out.println("rotas tentadas pela conta B: " + tentadas.size());
        assertThat(tentadas).hasSizeGreaterThan(70);
        assertThat(falhas).as("rotas que deixaram a conta B alcançar a conta A").isEmpty();
    }

    @Test
    void contaAEnxergaOQueEhDela() throws Exception
    {
        for (String recurso : List.of("competicao", "partida", "fase", "sumula", "sancao", "equipe",
                "atleta", "arbitro", "federacao", "administracao"))
        {
            comoA(get("/api/v1/" + recurso + "/{id}", deA.get(recurso)));
        }

        for (String lista : List.of("/competicao", "/equipe", "/atleta", "/arbitro", "/federacao", "/administracao"))
        {
            assertThat(texto(comoA(get("/api/v1" + lista)))).as(lista).contains(MARCA);
        }
    }

    /** Todo id de caminho e de corpo do sistema tem regra na porta. */
    @Test
    void todoIdDoSistemaTemRegra()
    {
        for (Map.Entry<RequestMappingInfo, HandlerMethod> rota : rotas.getHandlerMethods().entrySet())
        {
            for (String padrao : rota.getKey().getPathPatternsCondition().getPatternValues())
            {
                if (!MapaDaPorta.aplica(padrao))
                {
                    continue;
                }

                Matcher variavel = VARIAVEL.matcher(padrao);
                while (variavel.find())
                {
                    String nome = variavel.group(1);
                    assertThatCode(() -> MapaDaPorta.recursoDe(nome, padrao)).as(padrao).doesNotThrowAnyException();
                }

                for (Parameter parametro : rota.getValue().getMethod().getParameters())
                {
                    if (parametro.isAnnotationPresent(RequestBody.class) && parametro.getType().isRecord())
                    {
                        for (RecordComponent componente : parametro.getType().getRecordComponents())
                        {
                            if (MapaDaPorta.pareceId(componente.getName()))
                            {
                                assertThatCode(() -> MapaDaPorta.recursoDe(componente.getName(), padrao))
                                        .as(padrao + " " + parametro.getType().getSimpleName())
                                        .doesNotThrowAnyException();
                            }
                        }
                    }
                }
            }
        }
    }

    /* ------------------------------------------- ids no corpo e na query --- */

    @Test
    void idsDeANoCorpoOuNaQueryNaoPassam() throws Exception
    {
        Long competicaoDeB = criarComo(contaB, "/competicao", """
                {"nome":"Copa de B","modalidadesIds":[%d],"isMataMata":false,"descricao":"x","categoria":"x"}"""
                .formatted(modalidadeRepository.findByCodigo("FUTEBOL_DE_CAMPO").orElseThrow().getId()));

        List<String[]> tentativas = List.of(
                new String[]{"POST", "/api/v1/partida", """
                        {"idCompeticao":%d,"idEquipeMandante":%d,"idEquipeVisitante":%d}"""
                        .formatted(deA.get("competicao"), deA.get("equipe"), deA.get("equipe2"))},
                new String[]{"POST", "/api/v1/partida", """
                        {"idCompeticao":%d,"idEquipeMandante":%d,"idEquipeVisitante":%d}"""
                        .formatted(competicaoDeB, deA.get("equipe"), deA.get("equipe2"))},
                new String[]{"POST", "/api/v1/fase", """
                        {"nome":"x","ordem":1,"fasePartida":"PONTOS_CORRIDOS","idCompeticao":%d}"""
                        .formatted(deA.get("competicao"))},
                new String[]{"POST", "/api/v1/sumula", """
                        {"idPartida":%d}""".formatted(deA.get("partida"))},
                new String[]{"POST", "/api/v1/sancao", """
                        {"qtdPartidas":1,"tipoEsporte":"FUTEBOL","idCompeticao":%d}""".formatted(deA.get("competicao"))},
                new String[]{"POST", "/api/v1/competicao", """
                        {"nome":"x","modalidadesIds":[],"isMataMata":false,"idAdministracao":%d}"""
                        .formatted(deA.get("administracao"))},
                new String[]{"POST", "/api/v1/equipe", """
                        {"nome":"x","idFederacao":%d}""".formatted(deA.get("federacao"))},
                new String[]{"POST", "/api/v1/atleta", """
                        {"nome":"x","idEquipe":%d}""".formatted(deA.get("equipe"))},
                // O id do corpo de um PUT no recurso de B apontando para o de A.
                new String[]{"PUT", "/api/v1/competicao/" + competicaoDeB, """
                        {"id":%d,"nome":"tomada"}""".formatted(deA.get("competicao"))},
                new String[]{"POST", "/api/v1/competicao/" + competicaoDeB + "/equipe/" + deA.get("equipe"), "{}"},
                new String[]{"GET", "/api/v1/atleta?idEquipe=" + deA.get("equipe"), ""},
                new String[]{"GET", "/api/v1/competicao?idAdministracao=" + deA.get("administracao"), ""});

        for (String[] tentativa : tentativas)
        {
            mockMvc.perform(request(HttpMethod.valueOf(tentativa[0]), tentativa[1])
                            .with(como(contaB))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(tentativa[2]))
                    .andExpect(result -> assertThat(result.getResponse().getStatus())
                            .as(tentativa[0] + " " + tentativa[1] + " " + tentativa[2])
                            .isEqualTo(404));
        }
    }

    /* ------------------------------------------------- compartilhamento --- */

    @Test
    void compartilharDaAcessoATudoNaCompeticaoESoNela() throws Exception
    {
        comoA(post("/api/v1/competicao/{id}/pessoas", deA.get("competicao"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"CONTA.B@exemplo.com"}"""));

        // Dentro da competição, B pode tudo — inclusive editá-la e ver as equipes inscritas.
        comoB(get("/api/v1/competicao/{id}", deA.get("competicao")));
        comoB(get("/api/v1/equipe/{id}", deA.get("equipe")));
        comoB(get("/api/v1/atleta/{id}", deA.get("atleta")));
        comoB(get("/api/v1/sumula/{id}", deA.get("sumula")));
        comoB(put("/api/v1/competicao/{id}/visibilidade", deA.get("competicao"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"publica":true}"""));
        assertThat(texto(comoB(get("/api/v1/competicao")))).contains(MARCA + " Copa\"");

        // Fora dela, nada: a outra competição de A e a equipe que só joga nela.
        mockMvc.perform(get("/api/v1/competicao/{id}", deA.get("competicaoPrivada")).with(como(contaB)))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/equipe/{id}", deA.get("equipeFora")).with(como(contaB)))
                .andExpect(status().isNotFound());
        assertThat(texto(comoB(get("/api/v1/competicao")))).doesNotContain("Copa só de A");
        assertThat(texto(comoB(get("/api/v1/partida/equipe/{id}", deA.get("equipe"))))).isNotNull();

        // Tirada da competição, B volta a não enxergar nada dela.
        comoA(delete("/api/v1/competicao/{id}/pessoas/{idUsuario}", deA.get("competicao"), contaB.getId()));
        mockMvc.perform(get("/api/v1/competicao/{id}", deA.get("competicao")).with(como(contaB)))
                .andExpect(status().isNotFound());
    }

    @Test
    void ultimaPessoaNaoSaiDaCompeticao() throws Exception
    {
        mockMvc.perform(delete("/api/v1/competicao/{id}/pessoas/{idUsuario}", deA.get("competicaoPrivada"), contaA.getId())
                        .with(como(contaA)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void conviteViraParticipacaoNoCadastro() throws Exception
    {
        String corpo = mockMvc.perform(post("/api/v1/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Recém-chegada","email":"Ainda.Sem.Conta@exemplo.com","senha":"%s"}"""
                                .formatted(SENHA)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(corpo).get("token").asText();

        mockMvc.perform(get("/api/v1/competicao/{id}", deA.get("competicao"))
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        JsonNode pessoas = ler(comoA(get("/api/v1/competicao/{id}/pessoas", deA.get("competicao"))));
        assertThat(pessoas.get("convites")).isEmpty();
        assertThat(pessoas.get("participantes")).hasSize(2);
    }

    @Test
    void quemCriaEhDonoENinguemMaisVe() throws Exception
    {
        Long liga = criarComo(contaB, "/administracao", """
                {"nome":"Liga de B","descricao":"x"}""");

        assertThat(texto(comoB(get("/api/v1/administracao")))).contains("Liga de B");
        assertThat(texto(comoA(get("/api/v1/administracao")))).doesNotContain("Liga de B");
        mockMvc.perform(get("/api/v1/administracao/{id}", liga).with(como(contaA)))
                .andExpect(status().isNotFound());
    }

    /* ---------------------------------------------------------- apoio --- */

    private Usuario organizador(String email)
    {
        return usuarioService.novo("Conta " + email, email, SENHA,
                List.of(new PapelConcedidoRequest(Papel.ORGANIZADOR, null)));
    }

    private static RequestPostProcessor como(Usuario usuario)
    {
        return authentication(new UsernamePasswordAuthenticationToken(
                new UsuarioAutenticado(usuario.getId(), usuario.getEmail()), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + Papel.ORGANIZADOR))));
    }

    private MvcResult comoA(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder pedido)
            throws Exception
    {
        return executar(pedido, contaA);
    }

    private MvcResult comoB(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder pedido)
            throws Exception
    {
        return executar(pedido, contaB);
    }

    private MvcResult executar(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder pedido,
                               Usuario usuario) throws Exception
    {
        MvcResult resultado = mockMvc.perform(pedido.with(como(usuario))).andReturn();
        int codigo = resultado.getResponse().getStatus();
        assertThat(codigo).as(resultado.getRequest().getMethod() + " " + resultado.getRequest().getRequestURI()
                + " " + resultado.getResponse().getContentAsString()).isBetween(200, 299);
        return resultado;
    }

    private Long criar(String caminho, String corpo) throws Exception
    {
        return criarComo(contaA, caminho, corpo);
    }

    private Long criarComo(Usuario usuario, String caminho, String corpo) throws Exception
    {
        return ler(executar(post("/api/v1" + caminho).contentType(MediaType.APPLICATION_JSON).content(corpo), usuario))
                .get("id").asLong();
    }

    private JsonNode ler(MvcResult resultado) throws Exception
    {
        return objectMapper.readTree(resultado.getResponse().getContentAsString());
    }

    private static String texto(MvcResult resultado) throws Exception
    {
        return resultado.getResponse().getContentAsString();
    }

    private String preencher(String padrao)
    {
        Matcher variavel = VARIAVEL.matcher(padrao);
        StringBuilder url = new StringBuilder();
        while (variavel.find())
        {
            String nome = variavel.group(1);
            String valor = switch (nome)
            {
                case "id" -> String.valueOf(deA.getOrDefault(MapaDaPorta.trecho(padrao), 1L));
                case "idCompeticao" -> String.valueOf(deA.get("competicao"));
                case "idPartida" -> String.valueOf(deA.get("partida"));
                case "idEquipe" -> String.valueOf(deA.get("equipe"));
                case "idAtleta" -> String.valueOf(deA.get("atleta"));
                case "idArbitro" -> String.valueOf(deA.get("arbitro"));
                case "idEvento" -> String.valueOf(deA.get("evento"));
                case "idUsuario" -> String.valueOf(contaA.getId());
                case "idConvite" -> String.valueOf(deA.get("convite"));
                case "codigo" -> "QUALQUER";
                default -> throw new IllegalStateException("Variável sem valor de teste: " + nome + " em " + padrao);
            };
            variavel.appendReplacement(url, valor);
        }
        variavel.appendTail(url);
        return url.toString();
    }
}
