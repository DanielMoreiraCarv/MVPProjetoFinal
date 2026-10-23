package org.example.Controllers;

import org.example.Models.Competicao;
import org.example.Models.EnumEstadoCompeticao;
import org.example.Repositories.CompeticaoRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ORGANIZADOR")
@Transactional
class VisibilidadeDaCompeticaoTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CompeticaoRepository competicaoRepository;

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
        competicao = new Competicao();
        competicao.setNome("Copa da vizinhança");
        competicao.setLstEquipes(new ArrayList<>());
        competicao.setEstado(EnumEstadoCompeticao.RASCUNHO);
        competicao = competicaoRepository.save(competicao);
    }

    private ResultActions tornar(Long id, String corpo) throws Exception
    {
        return mockMvc.perform(put("/api/v1/competicao/{id}/visibilidade", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo));
    }

    @Test
    void nascePrivada() throws Exception
    {
        mockMvc.perform(get("/api/v1/competicao/{id}", competicao.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publica").value(false));
    }

    @Test
    void abreEFechaAoPublico() throws Exception
    {
        tornar(competicao.getId(), """
                {"publica":true}""")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publica").value(true));

        mockMvc.perform(get("/api/v1/competicao/{id}", competicao.getId()))
                .andExpect(jsonPath("$.publica").value(true));

        tornar(competicao.getId(), """
                {"publica":false}""")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publica").value(false));
    }

    /** Encerrada continua podendo ser mostrada: o resultado final é o que mais se compartilha. */
    @Test
    void encerradaAindaPodeSerAberta() throws Exception
    {
        competicao.setEstado(EnumEstadoCompeticao.ENCERRADA);
        competicaoRepository.save(competicao);

        tornar(competicao.getId(), """
                {"publica":true}""")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publica").value(true));
    }

    @Test
    void editarNaoMexeNaVisibilidade() throws Exception
    {
        tornar(competicao.getId(), """
                {"publica":true}""").andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/competicao/{id}", competicao.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"id":%d,"descricao":"Nova descrição"}""".formatted(competicao.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publica").value(true));
    }

    @Test
    void semOCampoRecusa() throws Exception
    {
        tornar(competicao.getId(), "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("VALIDACAO_FALHOU"));
    }

    @Test
    void competicaoInexistente() throws Exception
    {
        tornar(999_999L, """
                {"publica":true}""")
                .andExpect(status().isNotFound());
    }
}
