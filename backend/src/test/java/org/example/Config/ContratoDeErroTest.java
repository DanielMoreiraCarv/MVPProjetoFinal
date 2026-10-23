package org.example.Config;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.net.Socket;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * O contrato de erro visto de fora, pelo HTTP — que é como o front o vê.
 *
 * Testar o tratador por chamada direta de método provaria que ele monta o
 * record, não que a resposta chega com o corpo certo: quem decide isso é a
 * cadeia do Spring MVC, e é ela que estava devolvendo 400 vazio.
 */
@SpringBootTest
@AutoConfigureMockMvc
// Regra de domínio, não de acesso: roda como a plataforma, que vê tudo.
// O isolamento entre contas é provado em IsolamentoEntreContasTest.
@WithMockUser(roles = "ADMINISTRADOR")
class ContratoDeErroTest
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

    @Test
    void campoObrigatorioAusenteDizQualCampoEPorQue() throws Exception
    {
        mockMvc.perform(post("/api/v1/competicao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"modalidadesIds":[1],"isMataMata":false}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("VALIDACAO_FALHOU"))
                .andExpect(jsonPath("$.erro.mensagem").exists())
                .andExpect(jsonPath("$.erro.detalhes[?(@.campo == 'nome')]").exists());
    }

    @Test
    void listaVaziaDeModalidadesTambemViraDetalheDeCampo() throws Exception
    {
        mockMvc.perform(post("/api/v1/competicao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Copa de teste","modalidadesIds":[],"isMataMata":false}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("VALIDACAO_FALHOU"))
                .andExpect(jsonPath("$.erro.detalhes[?(@.campo == 'modalidadesIds')]").exists());
    }

    @Test
    void corpoQueNaoEhJsonValidoNaoVazaExcecaoDeParsing() throws Exception
    {
        mockMvc.perform(post("/api/v1/competicao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{isso nao e json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("ENTRADA_INVALIDA"))
                // A mensagem do Jackson cita a linha e a coluna do JSON e o
                // nome da classe de destino. Nada disso vai para a tela.
                .andExpect(jsonPath("$.erro.mensagem")
                        .value("A requisição não pôde ser interpretada. Confira o corpo e os parâmetros."));
    }

    @Test
    void idDeTipoErradoNoCaminhoNaoEstoura500() throws Exception
    {
        mockMvc.perform(get("/api/v1/competicao/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("ENTRADA_INVALIDA"));
    }

    @Test
    void regraDoDominioChegaComAPropriaMensagem() throws Exception
    {
        // Atualizar uma fase inexistente: o serviço sinaliza com exceção de
        // domínio, e a mensagem dela é escrita para ser lida.
        mockMvc.perform(put("/api/v1/fase/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"id":999999,"nome":"Fase fantasma","ordem":1}"""))
                .andExpect(status().is4xxClientError())
                .andExpect(jsonPath("$.erro").exists())
                .andExpect(jsonPath("$.erro.codigo").exists())
                .andExpect(jsonPath("$.erro.mensagem").exists());
    }

    @Test
    void todaFalhaTemOMesmoEnvelope() throws Exception
    {
        // Duas falhas de naturezas diferentes, um formato só: é o que permite
        // ao front ter um caminho de erro em vez de um por rota.
        mockMvc.perform(get("/api/v1/competicao/abc"))
                .andExpect(jsonPath("$.erro.codigo").exists())
                .andExpect(jsonPath("$.erro.mensagem").exists())
                .andExpect(jsonPath("$.erro.detalhes").isArray());

        mockMvc.perform(post("/api/v1/competicao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(jsonPath("$.erro.codigo").exists())
                .andExpect(jsonPath("$.erro.mensagem").exists())
                .andExpect(jsonPath("$.erro.detalhes").isArray());
    }

    @Test
    void rotaInexistenteEh404ComOEnvelope() throws Exception
    {
        mockMvc.perform(get("/api/v1/sumula/"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro.codigo").value("NAO_ENCONTRADO"));
    }
}
