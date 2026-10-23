package org.example.Controllers;

import org.example.Models.Competicao;
import org.example.Models.Modalidade;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.ModalidadeRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A regra de sanção é por esporte: a resposta devolve a mesma constante que o
 * pedido aceita, para a tela conseguir editar o que acabou de ler.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ORGANIZADOR")
@Transactional
class RegraDeSancaoTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    private Competicao competicao;

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
        Modalidade futebol = modalidadeRepository.findByCodigo("FUTEBOL_DE_CAMPO").orElseThrow();
        competicao = new Competicao();
        competicao.setNome("Copa de teste");
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao = competicaoRepository.save(competicao);
    }

    private org.springframework.test.web.servlet.ResultActions criar(String esporte) throws Exception
    {
        return mockMvc.perform(post("/api/v1/sancao")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"tipoEsporte":"%s","qtdPartidas":2,"idCompeticao":%d}"""
                        .formatted(esporte, competicao.getId())));
    }

    @Test
    void respostaDevolveAConstanteQueOPedidoAceita() throws Exception
    {
        criar("FUTEBOL")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipoEsporte").value("FUTEBOL"));
    }

    @Test
    void esporteInexistenteDizQuaisExistem() throws Exception
    {
        criar("Cartão vermelho")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(containsString("BASQUETE, VOLEI, FUTEBOL")));
    }
}
