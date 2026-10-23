package org.example.Controllers;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.net.Socket;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Rota de coleção responde `[]` quando não há nada, e não corpo vazio.
 *
 * Quatro mappers devolviam `null` para lista vazia, o que sai como 200 sem
 * corpo. O cliente estourava ao interpretar o JSON — a tela mostrava
 * "Unexpected end of JSON input" em vez de uma lista vazia. Coleção que existe
 * sem elementos é `[]`; ausência de recurso é 404.
 */
@SpringBootTest
@AutoConfigureMockMvc
// Regra de domínio, não de acesso: roda como a plataforma, que vê tudo.
// O isolamento entre contas é provado em IsolamentoEntreContasTest.
@WithMockUser(roles = "ADMINISTRADOR")
class ListaVaziaTest
{
    @Autowired
    private MockMvc mockMvc;

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

    /**
     * As rotas de coleção do sistema. Todas têm que responder um array, cheio
     * ou vazio — nenhuma pode responder corpo vazio.
     */
    @Test
    void todaRotaDeColecaoRespondeArray() throws Exception
    {
        String[] rotas = {
                "/api/v1/administracao",
                "/api/v1/competicao",
                "/api/v1/equipe",
                "/api/v1/atleta",
                "/api/v1/partida",
                "/api/v1/sumula",
                "/api/v1/fase",
                "/api/v1/arbitro",
                "/api/v1/modalidade",
                "/api/v1/federacao",
                "/api/v1/sancao",
                "/api/v1/sancao_atleta",
        };

        for (String rota : rotas)
        {
            mockMvc.perform(get(rota))
                    .andExpect(status().isOk())
                    .andExpect(content().string(org.hamcrest.Matchers.startsWith("[")))
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Test
    void colecaoAninhadaVaziaTambemEhArray() throws Exception
    {
        // O elenco de uma equipe recém-criada, e as modalidades de uma
        // competição: `null` aqui faria o cliente tratar ausência como erro.
        mockMvc.perform(get("/api/v1/fase").param("idCompeticao", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
