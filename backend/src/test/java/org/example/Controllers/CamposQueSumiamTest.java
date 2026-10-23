package org.example.Controllers;

import org.example.Models.Administracao;
import org.example.Models.Competicao;
import org.example.Models.Modalidade;
import org.example.Repositories.AdministracaoRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Campos que a API aceitava e jogava fora.
 *
 * Todos deste tipo: o pedido traz o valor, a rota responde sucesso, e o dado
 * não está lá. Não dá para descobrir olhando o código de quem chama, só
 * comparando o que entra com o que volta — que é o que estes testes fazem.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ORGANIZADOR")
@Transactional
class CamposQueSumiamTest
{
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private AdministracaoRepository administracaoRepository;

    private Modalidade futebol;
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
        futebol = modalidadeRepository.findByCodigo("FUTEBOL_DE_CAMPO").orElseThrow();

        Administracao administracao = new Administracao();
        administracao.setNome("Liga de teste");
        administracao = administracaoRepository.save(administracao);

        competicao = new Competicao();
        competicao.setNome("Copa de teste");
        competicao.setAdministracao(administracao);
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao.setLstEquipes(new ArrayList<>());
        competicao = competicaoRepository.save(competicao);
    }

    /**
     * `EquipeMapper.toEntity` copiava nome e federação e ignorava a
     * modalidade. A equipe nascia sem ela — e a inscrição na competição, que
     * compara modalidade, passava a recusar sempre.
     */
    @Test
    void criarEquipeGuardaAModalidade() throws Exception
    {
        mockMvc.perform(post("/api/v1/equipe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Equipe com modalidade","idModalidade":%d}"""
                                .formatted(futebol.getId())))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.modalidade.id").value(futebol.getId()));
    }

    /** `qtdClassificados` entrava no POST e voltava nulo. */
    @Test
    void criarFaseGuardaOsClassificados() throws Exception
    {
        mockMvc.perform(post("/api/v1/fase")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Grupos","ordem":1,"fasePartida":"GRUPOS",
                                 "idCompeticao":%d,"qtdClassificados":4}"""
                                .formatted(competicao.getId())))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.qtdClassificados").value(4));
    }

    /**
     * O pedido exige a constante e a resposta devolvia a descrição — o cliente
     * tinha que traduzir nos dois sentidos para marcar o formato atual num
     * seletor.
     */
    @Test
    void oFormatoVoltaComoAConstanteQueOPedidoExige() throws Exception
    {
        mockMvc.perform(post("/api/v1/fase")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Tabela","ordem":1,"fasePartida":"PONTOS_CORRIDOS",
                                 "idCompeticao":%d}""".formatted(competicao.getId())))
                .andExpect(jsonPath("$.fasePartida").value("PONTOS_CORRIDOS"));
    }

    /** Corrigir só a idade apagava o CPF e a modalidade do atleta. */
    @Test
    void atualizarAtletaNaoApagaOQueNaoFoiInformado() throws Exception
    {
        String criado = mockMvc.perform(post("/api/v1/atleta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Atleta completo","idade":20,"numCamisa":10,
                                 "cpf":"11144477735","idModalidade":%d}"""
                                .formatted(futebol.getId())))
                .andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString();

        long id = ((Number) com.jayway.jsonpath.JsonPath.read(criado, "$.id")).longValue();

        mockMvc.perform(put("/api/v1/atleta/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"id":%d,"idade":21}""".formatted(id)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/atleta/{id}", id))
                .andExpect(jsonPath("$.idade").value(21))
                .andExpect(jsonPath("$.nome").value("Atleta completo"))
                .andExpect(jsonPath("$.cpf").value("11144477735"))
                .andExpect(jsonPath("$.numCamisa").value(10));
    }

    /**
     * Os valores de atributo referenciam a fase: apagá-la sem apagá-los antes
     * violava a chave estrangeira, e o erro chegava como conflito genérico.
     */
    @Test
    void apagarFaseComAtributosGravadosFunciona() throws Exception
    {
        String criada = mockMvc.perform(post("/api/v1/fase")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Com atributos","ordem":1,"fasePartida":"GRUPOS",
                                 "idCompeticao":%d}""".formatted(competicao.getId())))
                .andReturn().getResponse().getContentAsString();

        long idFase = ((Number) com.jayway.jsonpath.JsonPath.read(criada, "$.id")).longValue();

        mockMvc.perform(put("/api/v1/fase/{id}/atributo/{codigo}", idFase, "numeroDeGrupos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"valor":"2"}"""))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/fase/{id}", idFase))
                .andExpect(status().is2xxSuccessful());
    }

    /**
     * O `catch` devolvia a mensagem como texto puro, fora do envelope: o
     * cliente que trata `{ erro: { … } }` recebia uma string solta.
     */
    @Test
    void falhaAoGerarConfrontosSaiNoEnvelopeDeErro() throws Exception
    {
        // Fase de grupos sem equipes e sem configuração: não há o que montar.
        String criada = mockMvc.perform(post("/api/v1/fase")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Impossível","ordem":1,"fasePartida":"GRUPOS",
                                 "idCompeticao":%d}""".formatted(competicao.getId())))
                .andReturn().getResponse().getContentAsString();

        long idFase = ((Number) com.jayway.jsonpath.JsonPath.read(criada, "$.id")).longValue();

        mockMvc.perform(post("/api/v1/fase/{id}/confrontos", idFase))
                .andExpect(status().is4xxClientError())
                .andExpect(jsonPath("$.erro.codigo").exists())
                .andExpect(jsonPath("$.erro.mensagem").exists());
    }
}
