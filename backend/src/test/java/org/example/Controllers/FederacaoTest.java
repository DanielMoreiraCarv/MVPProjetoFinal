package org.example.Controllers;

import org.example.Models.Equipe;
import org.example.Models.Federacao;
import org.example.Models.Modalidade;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.FederacaoRepository;
import org.example.Repositories.ModalidadeRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Federação pela API, e a correção que ela destravou na edição de equipe.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FederacaoTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FederacaoRepository federacaoRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    private Federacao federacao;
    private Modalidade futebol;

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
        futebol = modalidadeRepository.findByCodigo("FUTEBOL_DE_CAMPO").orElseThrow();

        federacao = new Federacao();
        federacao.setNomeFederacao("Federação de teste");
        federacao = federacaoRepository.save(federacao);
    }

    @Test
    void criarListarEBuscar() throws Exception
    {
        mockMvc.perform(post("/api/v1/federacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Federação Cearense"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.nome").value("Federação Cearense"));

        mockMvc.perform(get("/api/v1/federacao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nome == 'Federação Cearense')]").exists());

        mockMvc.perform(get("/api/v1/federacao/{id}", federacao.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Federação de teste"));
    }

    @Test
    void nomeEmBrancoDizQualCampoFalta() throws Exception
    {
        mockMvc.perform(post("/api/v1/federacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"  "}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("VALIDACAO_FALHOU"))
                .andExpect(jsonPath("$.erro.detalhes[?(@.campo == 'nome')]").exists());
    }

    @Test
    void atualizarTrocaONome() throws Exception
    {
        mockMvc.perform(put("/api/v1/federacao/{id}", federacao.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Federação renomeada"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Federação renomeada"));
    }

    @Test
    void excluirComEquipeVinculadaDizQuantasSeguram() throws Exception
    {
        Equipe equipe = new Equipe();
        equipe.setNome("Equipe vinculada");
        equipe.setModalidade(futebol);
        equipe.setFederacao(federacao);
        equipeRepository.save(equipe);

        mockMvc.perform(delete("/api/v1/federacao/{id}", federacao.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem")
                        .value(org.hamcrest.Matchers.containsString("1 equipe vinculada")));
    }

    @Test
    void excluirSemVinculoFunciona() throws Exception
    {
        mockMvc.perform(delete("/api/v1/federacao/{id}", federacao.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void federacaoInexistenteDaQuatrocentosEQuatroComCorpo() throws Exception
    {
        mockMvc.perform(get("/api/v1/federacao/{id}", 999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro.codigo").value("NAO_ENCONTRADO"));
    }

    /**
     * O defeito que esta entrega tranca: `atualizarEquipe` montava uma
     * Federacao e uma Modalidade vazias e as atribuía sempre. Renomear uma
     * equipe apagava as duas.
     */
    @Test
    void renomearEquipeNaoApagaFederacaoNemModalidade() throws Exception
    {
        Equipe equipe = new Equipe();
        equipe.setNome("Nome antigo");
        equipe.setModalidade(futebol);
        equipe.setFederacao(federacao);
        equipe = equipeRepository.save(equipe);

        mockMvc.perform(put("/api/v1/equipe/{id}", equipe.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Nome novo"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Nome novo"));

        Equipe recarregada = equipeRepository.findById(equipe.getId()).orElseThrow();
        assertNotNull(recarregada.getFederacao(), "a federação da equipe foi apagada no renome");
        assertNotNull(recarregada.getModalidade(), "a modalidade da equipe foi apagada no renome");
        assertEquals(federacao.getId(), recarregada.getFederacao().getId());
        assertEquals(futebol.getId(), recarregada.getModalidade().getId());
    }

    @Test
    void trocarAFederacaoDaEquipeFunciona() throws Exception
    {
        Federacao outra = new Federacao();
        outra.setNomeFederacao("Outra federação");
        outra = federacaoRepository.save(outra);

        Equipe equipe = new Equipe();
        equipe.setNome("Equipe");
        equipe.setModalidade(futebol);
        equipe.setFederacao(federacao);
        equipe = equipeRepository.save(equipe);

        mockMvc.perform(put("/api/v1/equipe/{id}", equipe.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idFederacao":%d}""".formatted(outra.getId())))
                .andExpect(status().isOk());

        Equipe recarregada = equipeRepository.findById(equipe.getId()).orElseThrow();
        assertEquals(outra.getId(), recarregada.getFederacao().getId());
        assertEquals("Equipe", recarregada.getNome());
    }
}
