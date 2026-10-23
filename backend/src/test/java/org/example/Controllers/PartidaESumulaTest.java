package org.example.Controllers;

import org.example.Models.Administracao;
import org.example.Models.Arbitro;
import org.example.Models.Competicao;
import org.example.Models.Equipe;
import org.example.Models.Modalidade;
import org.example.Repositories.AdministracaoRepository;
import org.example.Repositories.ArbitroRepository;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Partida e súmula pelas rotas, agora que as duas falam DTO.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ORGANIZADOR")
@Transactional
class PartidaESumulaTest
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

    @Autowired
    private ArbitroRepository arbitroRepository;

    private Competicao competicao;
    private Equipe mandante;
    private Equipe visitante;
    private Equipe forasteira;
    private Arbitro arbitro;

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

        mandante = novaEquipe("Mandante", futebol);
        visitante = novaEquipe("Visitante", futebol);
        forasteira = novaEquipe("Forasteira", futebol);

        competicao = new Competicao();
        competicao.setNome("Copa de teste");
        competicao.setAdministracao(administracao);
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao.setLstEquipes(new ArrayList<>(List.of(mandante, visitante)));
        competicao = competicaoRepository.save(competicao);

        arbitro = new Arbitro();
        arbitro.setNome("Árbitro de teste");
        arbitro = arbitroRepository.save(arbitro);
    }

    private Equipe novaEquipe(String nome, Modalidade modalidade)
    {
        Equipe equipe = new Equipe();
        equipe.setNome(nome);
        equipe.setModalidade(modalidade);
        return equipeRepository.save(equipe);
    }

    /**
     * Lê o id da partida criada.
     *
     * Estava com uma expressão regular gulosa sobre o corpo inteiro, que
     * capturava o último `id` da resposta — o da competição ou o do árbitro —
     * em vez do primeiro.
     */
    private Long criarPartida() throws Exception
    {
        String corpo = mockMvc.perform(post("/api/v1/partida")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDeCriacao(mandante.getId(), visitante.getId())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return ((Number) com.jayway.jsonpath.JsonPath.read(corpo, "$.id")).longValue();
    }

    private String corpoDeCriacao(Long idMandante, Long idVisitante)
    {
        return """
                {"idCompeticao":%d,"idEquipeMandante":%d,"idEquipeVisitante":%d,
                 "dataHora":"2026-02-07T09:00:00-03:00","local":"Campo do Bairro"}"""
                .formatted(competicao.getId(), idMandante, idVisitante);
    }

    @Test
    void criarPartidaComIdsEAgendamento() throws Exception
    {
        mockMvc.perform(post("/api/v1/partida")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDeCriacao(mandante.getId(), visitante.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.equipeMandante.nome").value("Mandante"))
                .andExpect(jsonPath("$.local").value("Campo do Bairro"))
                .andExpect(jsonPath("$.dataHora").exists())
                // Placar como número, não como a string "0 x 0" que o cliente
                // tinha que partir ao meio.
                .andExpect(jsonPath("$.placarMandante").value(0))
                .andExpect(jsonPath("$.placarVisitante").value(0));
    }

    /** A resposta da partida não traz o elenco das equipes. */
    @Test
    void respostaDaPartidaNaoCarregaOsElencos() throws Exception
    {
        mockMvc.perform(post("/api/v1/partida")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDeCriacao(mandante.getId(), visitante.getId())))
                .andExpect(jsonPath("$.equipeMandante.atletas").doesNotExist())
                .andExpect(jsonPath("$.equipeMandante.id").exists())
                .andExpect(jsonPath("$.equipeMandante.nome").exists());
    }

    @Test
    void mesmaEquipeDosDoisLadosEhRecusada() throws Exception
    {
        mockMvc.perform(post("/api/v1/partida")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDeCriacao(mandante.getId(), mandante.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("diferente da mandante")));
    }

    /**
     * Sem isto dá para marcar jogo entre equipes que não disputam o certame, e
     * a classificação passa a somar pontos para quem não está na tabela.
     */
    @Test
    void equipeNaoInscritaEhRecusada() throws Exception
    {
        mockMvc.perform(post("/api/v1/partida")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDeCriacao(mandante.getId(), forasteira.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("não está inscrita")));
    }

    @Test
    void competicaoObrigatoriaDizQualCampoFalta() throws Exception
    {
        mockMvc.perform(post("/api/v1/partida")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idEquipeMandante":1,"idEquipeVisitante":2}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.detalhes[?(@.campo == 'idCompeticao')]").exists());
    }

    /**
     * O caminho declarava `{idTime}` e o método recebia `idEquipe`: sobra do
     * renome de vocabulário. O Spring não ligava os dois e a rota respondia
     * 500 a qualquer chamada.
     */
    @Test
    void partidasDaEquipeRespondem() throws Exception
    {
        mockMvc.perform(post("/api/v1/partida")
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpoDeCriacao(mandante.getId(), visitante.getId())));

        mockMvc.perform(get("/api/v1/partida/equipe/{idEquipe}", mandante.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void agendarMarcaDiaHoraELugar() throws Exception
    {
        Long idPartida = criarPartida();

        mockMvc.perform(put("/api/v1/partida/{id}/agendamento", idPartida)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"dataHora":"2026-03-01T15:30:00-03:00","local":"Ginásio Central"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.local").value("Ginásio Central"));
    }

    @Test
    void escalarArbitroInexistenteDizQueEhOArbitro() throws Exception
    {
        Long idPartida = criarPartida();

        // Antes respondia "Partida N não encontrada" com o id da partida,
        // que existia — quem faltava era o árbitro.
        mockMvc.perform(put("/api/v1/partida/{id}/escalar-arbitro", idPartida)
                        .param("idArbitro", "999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("Árbitro")));
    }

    /**
     * Os dois ramos do antigo `/acompanhamento/{status}` chamavam
     * `listarPendentes()`: pedir as realizadas devolvia as que faltam jogar.
     */
    @Test
    void acompanhamentoSeparaRealizadasDePendentes() throws Exception
    {
        mockMvc.perform(post("/api/v1/partida")
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpoDeCriacao(mandante.getId(), visitante.getId())));

        mockMvc.perform(get("/api/v1/partida/acompanhamento").param("realizada", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.realizada == true)]").doesNotExist());

        mockMvc.perform(get("/api/v1/partida/acompanhamento").param("realizada", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.realizada == false)]").doesNotExist());
    }

    @Test
    void sumulaSaiComDtoENaoEntraEmRecursao() throws Exception
    {
        Long idPartida = criarPartida();

        mockMvc.perform(post("/api/v1/sumula")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idPartida":%d,"idArbitro":%d}"""
                                .formatted(idPartida, arbitro.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.partida.id").value(idPartida))
                // A partida dentro da súmula não traz a súmula de volta: é
                // esse laço que estourava a serialização.
                .andExpect(jsonPath("$.partida.sumula").doesNotExist())
                .andExpect(jsonPath("$.arbitro.nome").value("Árbitro de teste"));

        // E a partida encontra a súmula pelo caminho inverso.
        mockMvc.perform(get("/api/v1/sumula/partida/{idPartida}", idPartida))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.observacoes").doesNotExist());
    }

    @Test
    void duasSumulasParaAMesmaPartidaSaoRecusadas() throws Exception
    {
        Long idPartida = criarPartida();
        String pedido = """
                {"idPartida":%d}""".formatted(idPartida);

        mockMvc.perform(post("/api/v1/sumula")
                .contentType(MediaType.APPLICATION_JSON).content(pedido))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/sumula")
                        .contentType(MediaType.APPLICATION_JSON).content(pedido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("já tem súmula")));
    }

    @Test
    void partidaSemSumulaDizIsso() throws Exception
    {
        mockMvc.perform(get("/api/v1/sumula/partida/{idPartida}", 999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro.mensagem").value(
                        org.hamcrest.Matchers.containsString("ainda não tem súmula")));
    }
}
