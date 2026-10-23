package org.example.Controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.Models.Papel;
import org.example.Models.Request.PapelConcedidoRequest;
import org.example.Services.UsuarioService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Login, sessão e gestão de usuários pelo HTTP, como o front vai usar.
 */
@SpringBootTest
// O cadastro nasce fechado; aqui ele é aberto para testar o próprio cadastro.
@TestPropertySource(properties = "auth.cadastro-aberto=true")
@AutoConfigureMockMvc
@Transactional
class AutenticacaoTest
{
    private static final String SENHA = "senhaForte123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioService usuarioService;

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
    void cenario()
    {
        usuarioService.novo("Admin de teste", "admin.teste@exemplo.com", SENHA,
                List.of(new PapelConcedidoRequest(Papel.ADMINISTRADOR, null)));
    }

    @Test
    void cadastroEntraComoPublicoENaoDevolveASenha() throws Exception
    {
        cadastrar("Ana@Exemplo.com")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.tokenRenovacao").isString())
                .andExpect(jsonPath("$.usuario.email").value("ana@exemplo.com"))
                .andExpect(jsonPath("$.usuario.papeis[0].codigo").value("PUBLICO"))
                .andExpect(jsonPath("$.usuario.senhaHash").doesNotExist());
    }

    @Test
    void emailRepetidoSemDistinguirCaixaConflita() throws Exception
    {
        cadastrar("bia@exemplo.com").andExpect(status().isCreated());

        cadastrar("BIA@exemplo.com")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("REGRA_VIOLADA"));
    }

    @Test
    void senhaFracaEhRecusadaComOCampo() throws Exception
    {
        mockMvc.perform(post("/api/v1/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Caio","email":"caio@exemplo.com","senha":"curta"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.detalhes[?(@.campo == 'senha')]").exists());
    }

    @Test
    void emailInexistenteESenhaErradaRespondemIgual() throws Exception
    {
        entrar("ninguem@exemplo.com", SENHA)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro.codigo").value("CREDENCIAIS_INVALIDAS"));

        entrar("admin.teste@exemplo.com", "outraSenha123")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro.codigo").value("CREDENCIAIS_INVALIDAS"));
    }

    @Test
    void cincoErrosSeguidosBloqueiamAteComASenhaCerta() throws Exception
    {
        for (int tentativa = 1; tentativa < 5; tentativa++)
        {
            entrar("admin.teste@exemplo.com", "errada" + tentativa).andExpect(status().isUnauthorized());
        }

        entrar("admin.teste@exemplo.com", "errada5")
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.erro.codigo").value("CONTA_BLOQUEADA"));

        entrar("admin.teste@exemplo.com", SENHA).andExpect(status().isTooManyRequests());
    }

    @Test
    void rotaDaContaExigeToken() throws Exception
    {
        mockMvc.perform(get("/api/v1/auth/eu"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro.codigo").value("NAO_AUTENTICADO"));

        mockMvc.perform(get("/api/v1/auth/eu").header("Authorization", "Bearer nao-eh-um-jwt"))
                .andExpect(status().isUnauthorized());

        String token = sessao("admin.teste@exemplo.com", SENHA).get("token").asText();

        mockMvc.perform(get("/api/v1/auth/eu").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin.teste@exemplo.com"));
    }

    @Test
    void renovacaoEhDeUsoUnicoEReusoDerrubaTudo() throws Exception
    {
        String primeiro = sessao("admin.teste@exemplo.com", SENHA).get("tokenRenovacao").asText();

        JsonNode renovada = ler(renovar(primeiro).andExpect(status().isOk()));
        String segundo = renovada.get("tokenRenovacao").asText();

        // O primeiro já foi usado: quem o apresenta de novo pode ser um ladrão.
        renovar(primeiro)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro.codigo").value("SESSAO_INVALIDA"));

        // E por isso o segundo, legítimo ou não, também deixou de valer.
        renovar(segundo).andExpect(status().isUnauthorized());
    }

    @Test
    void sairRevogaARenovacao() throws Exception
    {
        String renovacao = sessao("admin.teste@exemplo.com", SENHA).get("tokenRenovacao").asText();

        mockMvc.perform(post("/api/v1/auth/sair")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDeRenovacao(renovacao)))
                .andExpect(status().isNoContent());

        renovar(renovacao).andExpect(status().isUnauthorized());
    }

    @Test
    void trocarSenhaExigeAAtualEEncerraAsOutrasSessoes() throws Exception
    {
        JsonNode sessao = sessao("admin.teste@exemplo.com", SENHA);
        String token = sessao.get("token").asText();

        mockMvc.perform(put("/api/v1/auth/senha")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"senhaAtual":"chuteErrado1","novaSenha":"novaSenha456"}"""))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/v1/auth/senha")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"senhaAtual":"%s","novaSenha":"novaSenha456"}""".formatted(SENHA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());

        renovar(sessao.get("tokenRenovacao").asText()).andExpect(status().isUnauthorized());
        entrar("admin.teste@exemplo.com", SENHA).andExpect(status().isUnauthorized());
        entrar("admin.teste@exemplo.com", "novaSenha456").andExpect(status().isOk());
    }

    @Test
    void gestaoDeUsuariosSoParaAdministrador() throws Exception
    {
        String publico = ler(cadastrar("dani@exemplo.com")).get("token").asText();
        String admin = sessao("admin.teste@exemplo.com", SENHA).get("token").asText();

        mockMvc.perform(get("/api/v1/usuario").header("Authorization", "Bearer " + publico))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro.codigo").value("ACESSO_NEGADO"));

        mockMvc.perform(get("/api/v1/usuario"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/usuario").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'dani@exemplo.com')]").exists());
    }

    @Test
    void administradorConcedePapelEDesativa() throws Exception
    {
        long id = ler(cadastrar("edu@exemplo.com")).get("usuario").get("id").asLong();
        String admin = sessao("admin.teste@exemplo.com", SENHA).get("token").asText();

        mockMvc.perform(put("/api/v1/usuario/" + id + "/papel")
                        .header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"papeis":[{"codigo":"ORGANIZADOR"},{"codigo":"ARBITRO"}]}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.papeis.length()").value(2));

        mockMvc.perform(delete("/api/v1/usuario/" + id).header("Authorization", "Bearer " + admin))
                .andExpect(status().isNoContent());

        entrar("edu@exemplo.com", SENHA)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro.codigo").value("USUARIO_INATIVO"));
    }

    @Test
    void administradorNaoTiraOProprioPapel() throws Exception
    {
        JsonNode sessao = sessao("admin.teste@exemplo.com", SENHA);
        long id = sessao.get("usuario").get("id").asLong();

        mockMvc.perform(put("/api/v1/usuario/" + id + "/papel")
                        .header("Authorization", "Bearer " + sessao.get("token").asText())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"papeis":[{"codigo":"PUBLICO"}]}"""))
                .andExpect(status().isBadRequest());
    }

    private ResultActions cadastrar(String email) throws Exception
    {
        return mockMvc.perform(post("/api/v1/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Pessoa de teste","email":"%s","senha":"%s"}""".formatted(email, SENHA)));
    }

    private ResultActions entrar(String email, String senha) throws Exception
    {
        return mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"%s","senha":"%s"}""".formatted(email, senha)));
    }

    private ResultActions renovar(String tokenRenovacao) throws Exception
    {
        return mockMvc.perform(post("/api/v1/auth/renovar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpoDeRenovacao(tokenRenovacao)));
    }

    private JsonNode sessao(String email, String senha) throws Exception
    {
        return ler(entrar(email, senha).andExpect(status().isOk()));
    }

    private JsonNode ler(ResultActions resultado) throws Exception
    {
        return objectMapper.readTree(resultado.andReturn().getResponse().getContentAsString());
    }

    private static String corpoDeRenovacao(String tokenRenovacao)
    {
        return """
                {"tokenRenovacao":"%s"}""".formatted(tokenRenovacao);
    }
}
