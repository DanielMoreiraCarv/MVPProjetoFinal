package org.example.Controllers;

import org.example.Models.Atleta;
import org.example.Models.Equipe;
import org.example.Models.Modalidade;
import org.example.Repositories.AtletaRepository;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.ModalidadeRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * O elenco de uma equipe, pelas rotas.
 *
 * O teste que importa mais aqui é `asDuasLeiturasConcordam`: o elenco estava
 * modelado duas vezes — pela coluna `atleta.equipe_id` e pela associativa
 * `equipe_atleta` — e `GET /equipe/{id}` lia uma enquanto
 * `GET /atleta?idEquipe=` lia a outra. Coincidiam porque o conjunto de teste
 * escrevia as duas; bastava uma escrita por um caminho para divergirem.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ElencoDaEquipeTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    private Equipe equipe;
    private Atleta atleta;
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

        equipe = new Equipe();
        equipe.setNome("Equipe de teste");
        equipe.setModalidade(futebol);
        equipe = equipeRepository.save(equipe);

        atleta = new Atleta();
        atleta.setNome("Atleta de teste");
        atleta.setModalidade(futebol);
        atleta = atletaRepository.save(atleta);
    }

    @Test
    void adicionarPoeOAtletaNoElenco() throws Exception
    {
        mockMvc.perform(post("/api/v1/equipe/{id}/atleta/{idAtleta}",
                        equipe.getId(), atleta.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/equipe/{id}/atleta", equipe.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == %d)]".formatted(atleta.getId())).exists());
    }

    /**
     * Com duas fontes, esta era a divergência possível: escrever por um
     * caminho e ler pelo outro.
     */
    @Test
    void asDuasLeiturasConcordam() throws Exception
    {
        mockMvc.perform(post("/api/v1/equipe/{id}/atleta/{idAtleta}",
                equipe.getId(), atleta.getId())).andExpect(status().isOk());

        // GET /equipe/{id} devolve o elenco aninhado…
        mockMvc.perform(get("/api/v1/equipe/{id}", equipe.getId()))
                .andExpect(jsonPath("$.atletas[?(@.id == %d)]".formatted(atleta.getId())).exists());

        // …e GET /atleta?idEquipe= devolve a mesma coisa.
        mockMvc.perform(get("/api/v1/atleta").param("idEquipe", equipe.getId().toString()))
                .andExpect(jsonPath("$[?(@.id == %d)]".formatted(atleta.getId())).exists());
    }

    @Test
    void removerTiraDaEquipeMasNaoApagaOAtleta() throws Exception
    {
        mockMvc.perform(post("/api/v1/equipe/{id}/atleta/{idAtleta}",
                equipe.getId(), atleta.getId())).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/equipe/{id}/atleta/{idAtleta}",
                        equipe.getId(), atleta.getId()))
                .andExpect(status().isOk());

        Atleta recarregado = atletaRepository.findById(atleta.getId()).orElse(null);
        assertNotNull(recarregado, "o atleta foi apagado junto com a saída da equipe");
        assertNull(recarregado.getEquipe(), "o atleta continuou vinculado à equipe");
    }

    @Test
    void atletaDeOutraModalidadeEhRecusadoComMotivo() throws Exception
    {
        Modalidade volei = modalidadeRepository.findByCodigo("VOLEIBOL").orElseThrow();
        Atleta deVolei = new Atleta();
        deVolei.setNome("Atleta de vôlei");
        deVolei.setModalidade(volei);
        deVolei = atletaRepository.save(deVolei);

        mockMvc.perform(post("/api/v1/equipe/{id}/atleta/{idAtleta}",
                        equipe.getId(), deVolei.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("REGRA_VIOLADA"))
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("outra modalidade")));
    }

    @Test
    void removerAtletaQueNaoEstaNaEquipeDizIsso() throws Exception
    {
        mockMvc.perform(delete("/api/v1/equipe/{id}/atleta/{idAtleta}",
                        equipe.getId(), atleta.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem")
                        .value(org.hamcrest.Matchers.containsString("não está em")));
    }

    @Test
    void elencoDeEquipeInexistenteDaQuatrocentosEQuatro() throws Exception
    {
        mockMvc.perform(get("/api/v1/equipe/{id}/atleta", 999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro.codigo").value("NAO_ENCONTRADO"));
    }

    @Test
    void equipesPodemSerFiltradasPorModalidade() throws Exception
    {
        mockMvc.perform(get("/api/v1/equipe").param("idModalidade", futebol.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == %d)]".formatted(equipe.getId())).exists());

        Modalidade volei = modalidadeRepository.findByCodigo("VOLEIBOL").orElseThrow();
        mockMvc.perform(get("/api/v1/equipe").param("idModalidade", volei.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == %d)]".formatted(equipe.getId())).doesNotExist());
    }

    @Test
    void elencoNaoDependeDeOrdemDeCadastro() throws Exception
    {
        // Dois atletas, adicionados em sequência: o segundo não substitui o
        // primeiro, que seria o sintoma de um vínculo um-para-um disfarçado.
        Atleta outro = new Atleta();
        outro.setNome("Outro atleta");
        outro.setModalidade(futebol);
        outro = atletaRepository.save(outro);

        mockMvc.perform(post("/api/v1/equipe/{id}/atleta/{idAtleta}",
                equipe.getId(), atleta.getId())).andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/equipe/{id}/atleta/{idAtleta}",
                equipe.getId(), outro.getId())).andExpect(status().isOk());

        assertEquals(2, atletaRepository.findByEquipeId(equipe.getId()).size());
    }
}
