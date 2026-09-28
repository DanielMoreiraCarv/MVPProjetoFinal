package org.example.Controllers;

import org.example.Models.Administracao;
import org.example.Models.Competicao;
import org.example.Models.EnumEstadoCompeticao;
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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EstadoDaCompeticaoTest
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
    private Equipe umaEquipe;

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

        Administracao administracao = new Administracao();
        administracao.setNome("Liga de teste");
        administracao = administracaoRepository.save(administracao);

        umaEquipe = novaEquipe("Equipe A", futebol);
        Equipe outra = novaEquipe("Equipe B", futebol);

        competicao = new Competicao();
        competicao.setNome("Copa de teste");
        competicao.setAdministracao(administracao);
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao.setLstEquipes(new ArrayList<>(List.of(umaEquipe, outra)));
        competicao.setEstado(EnumEstadoCompeticao.RASCUNHO);
        competicao = competicaoRepository.save(competicao);
    }

    private Equipe novaEquipe(String nome, Modalidade modalidade)
    {
        Equipe equipe = new Equipe();
        equipe.setNome(nome);
        equipe.setModalidade(modalidade);
        return equipeRepository.save(equipe);
    }

    private org.springframework.test.web.servlet.ResultActions mudarPara(String estado)
            throws Exception
    {
        return mockMvc.perform(put("/api/v1/competicao/{id}/estado", competicao.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"estado":"%s"}""".formatted(estado)));
    }

    @Test
    void rascunhoPodePublicar() throws Exception
    {
        mudarPara("EM_ANDAMENTO")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EM_ANDAMENTO"));
    }

    @Test
    void encerradaNaoVolta() throws Exception
    {
        mudarPara("EM_ANDAMENTO").andExpect(status().isOk());
        mudarPara("ENCERRADA").andExpect(status().isOk());

        mudarPara("EM_ANDAMENTO")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("não pode passar para")));
    }

    @Test
    void rascunhoNaoPulaDiretoParaEncerrada() throws Exception
    {
        mudarPara("ENCERRADA")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("EM_ANDAMENTO")));
    }

    @Test
    void canceladaEhDefinitiva() throws Exception
    {
        mudarPara("CANCELADA").andExpect(status().isOk());

        mudarPara("EM_ANDAMENTO")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("nenhum outro estado")));
    }

    @Test
    void publicarExigeDuasEquipes() throws Exception
    {
        Competicao vazia = new Competicao();
        vazia.setNome("Sem equipes");
        vazia.setLstEquipes(new ArrayList<>());
        vazia.setEstado(EnumEstadoCompeticao.RASCUNHO);
        vazia = competicaoRepository.save(vazia);

        mockMvc.perform(put("/api/v1/competicao/{id}/estado", vazia.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"estado":"EM_ANDAMENTO"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("duas equipes")));
    }

    /** Competição encerrada não aceita mais mexer nas inscrições. */
    @Test
    void encerradaNaoAceitaRemoverEquipe() throws Exception
    {
        mudarPara("EM_ANDAMENTO").andExpect(status().isOk());
        mudarPara("ENCERRADA").andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/competicao/{id}/equipe/{idEquipe}",
                        competicao.getId(), umaEquipe.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("não aceita alteração")));
    }

    @Test
    void estadoInvalidoNoCorpoNaoEstoura() throws Exception
    {
        mudarPara("INVENTADO")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.codigo").value("ENTRADA_INVALIDA"));
    }
}
