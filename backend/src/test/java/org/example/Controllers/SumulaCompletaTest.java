package org.example.Controllers;

import org.example.Models.Administracao;
import org.example.Models.Atleta;
import org.example.Models.Competicao;
import org.example.Models.Equipe;
import org.example.Models.Modalidade;
import org.example.Models.Partida;
import org.example.Repositories.AdministracaoRepository;
import org.example.Repositories.AtletaRepository;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.ModalidadeRepository;
import org.example.Repositories.PartidaRepository;
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
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A súmula completa: o que cada atleta fez, e o placar que anda junto com os
 * gols — sem deixar de aceitar o placar direto quando ninguém sabe quem marcou.
 */
@SpringBootTest
@AutoConfigureMockMvc
// Regra de domínio, não de acesso: roda como a plataforma, que vê tudo.
// O isolamento entre contas é provado em IsolamentoEntreContasTest.
@WithMockUser(roles = "ADMINISTRADOR")
@Transactional
class SumulaCompletaTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    @Autowired
    private AdministracaoRepository administracaoRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    private Partida partida;
    private Atleta doMandante;
    private Atleta doVisitante;
    private Atleta deFora;
    private Long idSumula;

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
    void cenario() throws Exception
    {
        Modalidade futebol = modalidadeRepository.findByCodigo("FUTEBOL_DE_CAMPO").orElseThrow();

        Administracao administracao = new Administracao();
        administracao.setNome("Liga de teste");
        administracao = administracaoRepository.save(administracao);

        Equipe mandante = novaEquipe("Mandante", futebol);
        Equipe visitante = novaEquipe("Visitante", futebol);
        Equipe forasteira = novaEquipe("Forasteira", futebol);
        doMandante = novoAtleta("Artilheiro", 9, mandante);
        doVisitante = novoAtleta("Zagueiro", 4, visitante);
        deFora = novoAtleta("Intruso", 10, forasteira);

        Competicao competicao = new Competicao();
        competicao.setNome("Copa de teste");
        competicao.setAdministracao(administracao);
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao.setLstEquipes(new ArrayList<>(List.of(mandante, visitante)));
        competicao = competicaoRepository.save(competicao);

        partida = new Partida();
        partida.setCompeticao(competicao);
        partida.setEquipeMandante(mandante);
        partida.setEquipeVisitante(visitante);
        partida = partidaRepository.save(partida);

        String corpo = mockMvc.perform(post("/api/v1/sumula")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idPartida":%d}""".formatted(partida.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.modo").value("COMPLETA"))
                .andReturn().getResponse().getContentAsString();
        idSumula = ((Number) com.jayway.jsonpath.JsonPath.read(corpo, "$.id")).longValue();
    }

    private Equipe novaEquipe(String nome, Modalidade modalidade)
    {
        Equipe equipe = new Equipe();
        equipe.setNome(nome);
        equipe.setModalidade(modalidade);
        return equipeRepository.save(equipe);
    }

    private Atleta novoAtleta(String nome, int camisa, Equipe equipe)
    {
        Atleta atleta = new Atleta();
        atleta.setNome(nome);
        atleta.setNumCamisa(camisa);
        atleta.setEquipe(equipe);
        return atletaRepository.save(atleta);
    }

    private ResultActions lancar(Atleta atleta, String tipo) throws Exception
    {
        return mockMvc.perform(post("/api/v1/sumula/{id}/evento", idSumula)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"idAtleta":%d,"tipo":"%s"}""".formatted(atleta.getId(), tipo)));
    }

    private ResultActions placar(int mandante, int visitante) throws Exception
    {
        return mockMvc.perform(put("/api/v1/sumula/{id}", idSumula)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"placarMandante":%d,"placarVisitante":%d}""".formatted(mandante, visitante)));
    }

    private Long idDoEvento(ResultActions resposta, int indice) throws Exception
    {
        String corpo = resposta.andReturn().getResponse().getContentAsString();
        return ((Number) com.jayway.jsonpath.JsonPath.read(corpo, "$.eventos[" + indice + "].id")).longValue();
    }

    @Test
    void golDoAtletaSobeOPlacarDaEquipeDele() throws Exception
    {
        lancar(doMandante, "GOL")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.placarMandante").value(1))
                .andExpect(jsonPath("$.placarVisitante").value(0))
                .andExpect(jsonPath("$.eventos[0].nomeAtleta").value("Artilheiro"))
                .andExpect(jsonPath("$.eventos[0].registradoEm").exists());
    }

    @Test
    void golContraContaParaOAdversario() throws Exception
    {
        lancar(doVisitante, "GOL_CONTRA")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.placarMandante").value(1))
                .andExpect(jsonPath("$.placarVisitante").value(0));
    }

    @Test
    void removerOGolDesfazOPlacar() throws Exception
    {
        Long idGol = idDoEvento(lancar(doMandante, "GOL"), 0);

        mockMvc.perform(delete("/api/v1/sumula/{id}/evento/{idEvento}", idSumula, idGol))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.placarMandante").value(0))
                .andExpect(jsonPath("$.eventos", hasSize(0)));
    }

    @Test
    void atletaDeOutraEquipeEhRecusado() throws Exception
    {
        lancar(deFora, "GOL")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(containsString("não joga esta partida")));
    }

    @Test
    void segundoAmareloViraVermelhoIndireto() throws Exception
    {
        lancar(doMandante, "CARTAO_AMARELO").andExpect(status().isOk());
        ResultActions segundo = lancar(doMandante, "CARTAO_AMARELO")
                .andExpect(jsonPath("$.eventos", hasSize(3)))
                .andExpect(jsonPath("$.eventos[2].tipo").value("CARTAO_VERMELHO_INDIRETO"))
                .andExpect(jsonPath("$.eventos[2].automatico").value(true));

        // Tirar o segundo amarelo leva junto o vermelho que ele gerou.
        mockMvc.perform(delete("/api/v1/sumula/{id}/evento/{idEvento}", idSumula, idDoEvento(segundo, 1)))
                .andExpect(jsonPath("$.eventos", hasSize(1)))
                .andExpect(jsonPath("$.eventos[0].tipo").value("CARTAO_AMARELO"));
    }

    @Test
    void placarDiretoAceitaGolSemAutor() throws Exception
    {
        lancar(doMandante, "GOL");

        placar(3, 1)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.placarMandante").value(3))
                .andExpect(jsonPath("$.placarVisitante").value(1));
    }

    @Test
    void placarAbaixoDosGolsComAutorEhRecusado() throws Exception
    {
        lancar(doMandante, "GOL");
        lancar(doMandante, "GOL");

        placar(1, 0)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(containsString("2 gols com autor")));
    }

    @Test
    void placarDaSumulaAparecaNaPartida() throws Exception
    {
        lancar(doMandante, "GOL");

        Partida atualizada = partidaRepository.findById(partida.getId()).orElseThrow();
        assertEquals(1, atualizada.getPlacarMandante());
    }

    @Test
    void assinarEncerraAPartidaComOPlacarDaSumula() throws Exception
    {
        lancar(doVisitante, "GOL");

        mockMvc.perform(post("/api/v1/sumula/{id}/finalizar", idSumula)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"placarMandante":0,"placarVisitante":1,"observacoes":"Sem incidentes."}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assinada").value(true));

        Partida encerrada = partidaRepository.findById(partida.getId()).orElseThrow();
        assertTrue(encerrada.isRealizada());
        assertEquals(1, encerrada.getPlacarVisitante());

        lancar(doMandante, "GOL")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(containsString("assinada")));
    }

    /**
     * A partida segura a súmula com cascata: apagar só pelo repositório
     * respondia 204 e o Hibernate desfazia a exclusão sem avisar.
     */
    @Test
    void excluirApagaDeVerdadeEPermiteAbrirOutra() throws Exception
    {
        lancar(doMandante, "GOL");

        mockMvc.perform(delete("/api/v1/sumula/{id}", idSumula))
                .andExpect(status().isNoContent());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/v1/sumula/partida/{idPartida}", partida.getId()))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/sumula")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idPartida":%d}""".formatted(partida.getId())))
                .andExpect(status().isCreated());
    }

    @Test
    void modoSimplificadoFicaGravado() throws Exception
    {
        mockMvc.perform(put("/api/v1/sumula/{id}", idSumula)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"modo":"SIMPLIFICADA"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modo").value("SIMPLIFICADA"));
    }
}
