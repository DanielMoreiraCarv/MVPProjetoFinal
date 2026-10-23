package org.example.Controllers;

import org.example.Models.Administracao;
import org.example.Models.Competicao;
import org.example.Models.Equipe;
import org.example.Models.Modalidade;
import org.example.Repositories.AdministracaoRepository;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.ModalidadeRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Inscrever e remover equipe de uma competição.
 *
 * Os métodos de serviço existiam desde sempre e nenhum controller os chamava,
 * então remover uma equipe era impossível pela API. Expor não bastava: a
 * remoção estava quebrada por baixo, e o teste de `removerNaoDependeDeEquals`
 * é o que prova isso.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ORGANIZADOR")
@Transactional
class InscricaoDeEquipeTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    @Autowired
    private AdministracaoRepository administracaoRepository;

    private Competicao competicao;
    private Equipe equipe;
    private Modalidade futebol;
    private Modalidade volei;

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
        volei = modalidadeRepository.findByCodigo("VOLEIBOL").orElseThrow();

        Administracao administracao = new Administracao();
        administracao.setNome("Liga de teste");
        administracao = administracaoRepository.save(administracao);

        competicao = new Competicao();
        competicao.setNome("Copa de teste");
        competicao.setAdministracao(administracao);
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao.setLstEquipes(new ArrayList<>());
        competicao = competicaoRepository.save(competicao);

        equipe = new Equipe();
        equipe.setNome("Equipe de teste");
        equipe.setModalidade(futebol);
        equipe = equipeRepository.save(equipe);
    }

    @Test
    void inscreverColocaAEquipeNaCompeticao() throws Exception
    {
        mockMvc.perform(post("/api/v1/competicao/{id}/equipe/{idEquipe}",
                        competicao.getId(), equipe.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipes[?(@.id == %d)]".formatted(equipe.getId())).exists());
    }

    /**
     * O defeito que este teste tranca: `removerEquipe` fazia
     * `lstEquipes.remove(equipe)`, e `Equipe` não redefine `equals`. A
     * instância que chega pela rota vem de outra consulta, então a comparação
     * por identidade nunca casava e a remoção respondia sucesso sem remover.
     */
    @Test
    void removerNaoDependeDeEquals() throws Exception
    {
        mockMvc.perform(post("/api/v1/competicao/{id}/equipe/{idEquipe}",
                competicao.getId(), equipe.getId())).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/competicao/{id}/equipe/{idEquipe}",
                        competicao.getId(), equipe.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipes[?(@.id == %d)]".formatted(equipe.getId()))
                        .doesNotExist());

        Competicao recarregada = competicaoRepository.findById(competicao.getId()).orElseThrow();
        assertTrue(recarregada.getLstEquipes().stream()
                        .noneMatch(inscrita -> inscrita.getId().equals(equipe.getId())),
                "a equipe continuou inscrita no banco depois do DELETE");
    }

    @Test
    void inscreverDuasVezesNaoDuplica() throws Exception
    {
        for (int i = 0; i < 2; i++)
        {
            mockMvc.perform(post("/api/v1/competicao/{id}/equipe/{idEquipe}",
                    competicao.getId(), equipe.getId())).andExpect(status().isOk());
        }

        Competicao recarregada = competicaoRepository.findById(competicao.getId()).orElseThrow();
        assertEquals(1, recarregada.getLstEquipes().size());
    }

    /**
     * Antes isto imprimia no stdout e retornava normalmente: quem chamava
     * recebia sucesso e a equipe não estava lá.
     */
    @Test
    void equipeDeOutraModalidadeEhRecusadaComMotivo() throws Exception
    {
        Equipe deVolei = new Equipe();
        deVolei.setNome("Equipe de vôlei");
        deVolei.setModalidade(volei);
        deVolei = equipeRepository.save(deVolei);

        mockMvc.perform(post("/api/v1/competicao/{id}/equipe/{idEquipe}",
                        competicao.getId(), deVolei.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("REGRA_VIOLADA"))
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("outra modalidade")));
    }

    @Test
    void removerEquipeNaoInscritaDizIsso() throws Exception
    {
        mockMvc.perform(delete("/api/v1/competicao/{id}/equipe/{idEquipe}",
                        competicao.getId(), equipe.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("não está inscrita")));
    }

    @Test
    void competicaoInexistenteDaQuatrocentosEQuatroComCorpo() throws Exception
    {
        mockMvc.perform(post("/api/v1/competicao/{id}/equipe/{idEquipe}", 999999, equipe.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro.codigo").value("NAO_ENCONTRADO"));
    }

    @Test
    void equipeInexistenteDaQuatrocentosEQuatroComCorpo() throws Exception
    {
        mockMvc.perform(post("/api/v1/competicao/{id}/equipe/{idEquipe}",
                        competicao.getId(), 999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro.codigo").value("NAO_ENCONTRADO"));
    }
}
