package org.example.Controllers;

import org.example.Models.Administracao;
import org.example.Models.Competicao;
import org.example.Models.EnumEstadoCompeticao;
import org.example.Models.Equipe;
import org.example.Models.Modalidade;
import org.example.Models.Partida;
import org.example.Repositories.AdministracaoRepository;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Remover competição e administração: o que tem histórico é recusado com o
 * motivo, em vez do 409 genérico da violação de chave estrangeira.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ORGANIZADOR")
@Transactional
class RemocaoDeCompeticaoTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private AdministracaoRepository administracaoRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    private Administracao administracao;
    private Competicao competicao;
    private Equipe mandante;
    private Equipe visitante;

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

        administracao = new Administracao();
        administracao.setNome("Liga de teste");
        administracao = administracaoRepository.save(administracao);

        mandante = novaEquipe("Equipe A", futebol);
        visitante = novaEquipe("Equipe B", futebol);

        competicao = new Competicao();
        competicao.setNome("Copa de teste");
        competicao.setAdministracao(administracao);
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao.setLstEquipes(new ArrayList<>(List.of(mandante, visitante)));
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

    @Test
    void competicaoSemHistoricoSaiEAsEquipesFicam() throws Exception
    {
        mockMvc.perform(delete("/api/v1/competicao/{id}", competicao.getId()))
                .andExpect(status().isNoContent());

        assertFalse(competicaoRepository.existsById(competicao.getId()));
        assertTrue(equipeRepository.existsById(mandante.getId()));
    }

    @Test
    void competicaoComPartidaPedeCancelamento() throws Exception
    {
        Partida partida = new Partida();
        partida.setCompeticao(competicao);
        partida.setEquipeMandante(mandante);
        partida.setEquipeVisitante(visitante);
        partidaRepository.save(partida);

        mockMvc.perform(delete("/api/v1/competicao/{id}", competicao.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(containsString("1 partida")))
                .andExpect(jsonPath("$.erro.mensagem").value(containsString("Cancele")));
    }

    @Test
    void administracaoComCompeticaoDizQuantas() throws Exception
    {
        mockMvc.perform(delete("/api/v1/administracao/{id}", administracao.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(containsString("organiza 1 competição")));
    }

    @Test
    void administracaoVaziaSai() throws Exception
    {
        competicaoRepository.delete(competicao);

        mockMvc.perform(delete("/api/v1/administracao/{id}", administracao.getId()))
                .andExpect(status().isNoContent());

        assertFalse(administracaoRepository.existsById(administracao.getId()));
    }
}
