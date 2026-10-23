package org.example.Seguranca;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.Models.Papel;
import org.example.Models.Request.PapelConcedidoRequest;
import org.example.Services.UsuarioService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Quem pode chamar o quê, com a configuração de produção: sem login só o
 * acompanhamento e as rotas de entrar; a gestão exige papel de gestão.
 *
 * Os outros testes de controller rodam como organizador e provam o domínio;
 * este prova a porta.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RotasProtegidasTest
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

    @Test
    void anonimoSoAcompanhaEEntra() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/competicao"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/competicao"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro.codigo").value("NAO_AUTENTICADO"));
        mockMvc.perform(get("/api/v1/modalidade"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/competicao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/sumula/partida/1"))
                .andExpect(status().isUnauthorized());

        // Chega ao controller: o corpo vazio é recusado pela validação, não pela porta.
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cadastroAbreContaDeOrganizacaoQueEntraNaGestao() throws Exception
    {
        String corpo = mockMvc.perform(post("/api/v1/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Nova organização","email":"nova.organizacao@exemplo.com","senha":"%s"}"""
                                .formatted(SENHA)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuario.papeis[0].codigo").value(Papel.ORGANIZADOR))
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(corpo).get("token").asText();

        mockMvc.perform(get("/api/v1/competicao").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/usuario").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = Papel.PUBLICO)
    void publicoNaoEntraNaGestao() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/competicao"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/competicao"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro.codigo").value("ACESSO_NEGADO"));
        mockMvc.perform(put("/api/v1/competicao/1/visibilidade")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"publica":true}"""))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = Papel.MESARIO)
    void mesaLeAGestaoEPreencheASumulaMasNaoMontaACompeticao() throws Exception
    {
        mockMvc.perform(get("/api/v1/competicao"))
                .andExpect(status().isOk());

        // Passa pela porta e é recusado pelo domínio: a partida não existe.
        mockMvc.perform(post("/api/v1/sumula")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idPartida":999999}"""))
                .andExpect(result -> {
                    int codigo = result.getResponse().getStatus();
                    if (codigo == 401 || codigo == 403)
                    {
                        throw new AssertionError("A mesa foi barrada na súmula: HTTP " + codigo);
                    }
                });

        mockMvc.perform(post("/api/v1/competicao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = Papel.ORGANIZADOR)
    void organizacaoMontaACompeticaoMasNaoGereUsuarios() throws Exception
    {
        mockMvc.perform(put("/api/v1/competicao/999999/visibilidade")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"publica":true}"""))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/usuario"))
                .andExpect(status().isForbidden());
    }

    @Test
    void tokenDeVerdadeAbreAGestao() throws Exception
    {
        usuarioService.novo("Organização de teste", "organizacao.teste@exemplo.com", SENHA,
                List.of(new PapelConcedidoRequest(Papel.ORGANIZADOR, null)));

        String corpo = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"organizacao.teste@exemplo.com","senha":"%s"}""".formatted(SENHA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(corpo).get("token").asText();

        mockMvc.perform(get("/api/v1/competicao").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/competicao").header("Authorization", "Bearer " + token + "x"))
                .andExpect(status().isUnauthorized());
    }
}
