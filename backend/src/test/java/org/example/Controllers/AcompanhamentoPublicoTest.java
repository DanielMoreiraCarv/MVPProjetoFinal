package org.example.Controllers;

import org.example.Models.Atleta;
import org.example.Models.Competicao;
import org.example.Models.EnumEstadoCompeticao;
import org.example.Models.EnumFasePartida;
import org.example.Models.Equipe;
import org.example.Models.Fase;
import org.example.Models.Modalidade;
import org.example.Models.Partida;
import org.example.Repositories.AtletaRepository;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.ModalidadeRepository;
import org.example.Repositories.PartidaRepository;
import jakarta.persistence.EntityManager;
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

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * O acompanhamento por link só enxerga competição aberta ao público. Privada
 * e inexistente respondem igual — 404 —, para o link não confirmar que uma
 * competição fechada existe.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AcompanhamentoPublicoTest
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
    private PartidaRepository partidaRepository;

    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    @Autowired
    private EntityManager entityManager;

    private Competicao aberta;
    private Competicao fechada;
    private Equipe daAberta;
    private Equipe soDaFechada;
    private Partida partidaAberta;
    private Partida partidaFechada;
    private Fase faseFechada;

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

        daAberta = novaEquipe("Equipe da aberta", futebol);
        Equipe outraDaAberta = novaEquipe("Outra da aberta", futebol);
        soDaFechada = novaEquipe("Equipe só da fechada", futebol);
        Equipe outraDaFechada = novaEquipe("Outra da fechada", futebol);

        Atleta menor = new Atleta();
        menor.setNome("Atleta de doze anos");
        menor.setNumCamisa(10);
        menor.setIdade(12);
        menor.setCpf("12345678900");
        menor.setEquipe(daAberta);
        atletaRepository.save(menor);

        aberta = novaCompeticao("Copa aberta", true, futebol, daAberta, outraDaAberta);
        fechada = novaCompeticao("Copa fechada", false, futebol, soDaFechada, outraDaFechada);

        partidaAberta = novaPartida(aberta, daAberta, outraDaAberta);
        partidaFechada = novaPartida(fechada, soDaFechada, outraDaFechada);

        faseFechada = new Fase();
        faseFechada.setNome("Tabela");
        faseFechada.setOrdem(1);
        faseFechada.setFasePartida(EnumFasePartida.PONTOS_CORRIDOS);
        faseFechada.setCompeticao(fechada);
        faseFechada = faseRepository.save(faseFechada);

        // As rotas leem do banco, não das instâncias montadas acima: sem
        // isto a equipe carregada não veria o atleta gravado depois dela.
        entityManager.flush();
        entityManager.clear();
    }

    private Equipe novaEquipe(String nome, Modalidade modalidade)
    {
        Equipe equipe = new Equipe();
        equipe.setNome(nome);
        equipe.setModalidade(modalidade);
        return equipeRepository.save(equipe);
    }

    private Competicao novaCompeticao(String nome, boolean publica, Modalidade modalidade, Equipe... equipes)
    {
        Competicao competicao = new Competicao();
        competicao.setNome(nome);
        competicao.setPublica(publica);
        competicao.setEstado(EnumEstadoCompeticao.EM_ANDAMENTO);
        competicao.setLstModalidades(new ArrayList<>(List.of(modalidade)));
        competicao.setLstEquipes(new ArrayList<>(List.of(equipes)));
        return competicaoRepository.save(competicao);
    }

    private Partida novaPartida(Competicao competicao, Equipe mandante, Equipe visitante)
    {
        Partida partida = new Partida();
        partida.setCompeticao(competicao);
        partida.setEquipeMandante(mandante);
        partida.setEquipeVisitante(visitante);
        return partidaRepository.save(partida);
    }

    @Test
    void listaSoAsAbertas() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/competicao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id").value(hasItem(aberta.getId().intValue())))
                .andExpect(jsonPath("$[*].id").value(not(hasItem(fechada.getId().intValue()))));
    }

    @Test
    void abertaSemDadosPessoaisDosAtletas() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/competicao/{id}", aberta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publica").value(true))
                .andExpect(jsonPath("$.equipes[?(@.id == %d)].atletas[0].nome".formatted(daAberta.getId()))
                        .value(hasItem("Atleta de doze anos")))
                .andExpect(jsonPath("$.equipes[*].atletas[*].cpf").value(not(hasItem("12345678900"))))
                .andExpect(jsonPath("$.equipes[*].atletas[*].idade").value(not(hasItem(12))));
    }

    @Test
    void fechadaEInexistenteRespondemIgual() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/competicao/{id}", fechada.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/competicao/{id}", 999_999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void oQueEhDaFechadaNaoSaiPorNenhumaRota() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/competicao/{id}/estrutura", fechada.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/fase").param("idCompeticao", fechada.getId().toString()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/fase/{id}/tabela", faseFechada.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/fase/{id}/chaveamento", faseFechada.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/partida/competicao/{id}", fechada.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/partida/{id}", partidaFechada.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/sumula/partida/{id}", partidaFechada.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/equipe/{id}/atleta", soDaFechada.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void oQueEhDaAbertaSaiComoNaGestao() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/competicao/{id}/estrutura", aberta.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/publico/fase").param("idCompeticao", aberta.getId().toString()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/publico/partida/competicao/{id}", aberta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(partidaAberta.getId()));
        mockMvc.perform(get("/api/v1/publico/partida/{id}", partidaAberta.getId()))
                .andExpect(status().isOk());
    }

    @Test
    void sumulaDaAbertaAcompanhaAoVivo() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/sumula/partida/{id}", partidaAberta.getId()))
                .andExpect(status().isNotFound());

        // Abrir a súmula é coisa da mesa; quem acompanha só lê.
        mockMvc.perform(post("/api/v1/sumula")
                        .with(user("mesa").roles("MESARIO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idPartida":%d}""".formatted(partidaAberta.getId())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/publico/sumula/partida/{id}", partidaAberta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.placarMandante").value(0));
    }

    @Test
    void elencoDeEquipeDaAbertaSemDadosPessoais() throws Exception
    {
        mockMvc.perform(get("/api/v1/publico/equipe/{id}/atleta", daAberta.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Atleta de doze anos"))
                .andExpect(jsonPath("$[0].numCamisa").value(10))
                .andExpect(jsonPath("$[0].cpf").doesNotExist())
                .andExpect(jsonPath("$[0].idade").doesNotExist());
    }

    @Test
    void fecharTiraDoArNaHora() throws Exception
    {
        aberta.setPublica(false);
        competicaoRepository.save(aberta);

        mockMvc.perform(get("/api/v1/publico/partida/{id}", partidaAberta.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/publico/equipe/{id}/atleta", daAberta.getId()))
                .andExpect(status().isNotFound());
    }
}
