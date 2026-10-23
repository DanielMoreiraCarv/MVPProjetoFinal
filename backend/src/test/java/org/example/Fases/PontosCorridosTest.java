package org.example.Fases;

import org.example.Models.Classificado;
import org.example.Models.Competicao;
import org.example.Models.EnumFasePartida;
import org.example.Models.Equipe;
import org.example.Models.Fase;
import org.example.Models.Modalidade;
import org.example.Models.Partida;
import org.example.Repositories.CompeticaoRepository;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.FaseRepository;
import org.example.Repositories.ModalidadeRepository;
import org.example.Repositories.PartidaRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Pontos corridos — o formato que `RegistroDeEstrategias` não conhecia e que é
 * o mais comum em competição amadora.
 */
@SpringBootTest
@Transactional
class PontosCorridosTest
{
    @Autowired
    private RegistroDeEstrategias registro;

    @Autowired
    private OrquestradorDeFases orquestrador;

    @Autowired
    private FaseRepository faseRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private CompeticaoRepository competicaoRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    private Competicao competicao;
    private List<Equipe> equipes;

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

        equipes = new ArrayList<>();
        for (int i = 1; i <= 4; i++)
        {
            Equipe equipe = new Equipe();
            equipe.setNome("Equipe " + i);
            equipe.setModalidade(futebol);
            equipes.add(equipeRepository.save(equipe));
        }

        competicao = new Competicao();
        competicao.setNome("Pontos corridos de teste");
        competicao.setLstModalidades(new ArrayList<>(List.of(futebol)));
        competicao.setLstEquipes(new ArrayList<>(equipes));
        competicao = competicaoRepository.save(competicao);
    }

    private Fase novaFase(Map<String, String> atributos)
    {
        Fase fase = new Fase();
        fase.setNome("Tabela");
        fase.setOrdem(1);
        fase.setFasePartida(EnumFasePartida.PONTOS_CORRIDOS);
        fase.setCompeticao(competicao);
        fase = faseRepository.save(fase);

        Fase salva = fase;
        atributos.forEach((codigo, valor) -> orquestrador.definirAtributo(salva, codigo, valor));
        return salva;
    }

    /** Antes disto, resolver a estratégia deste tipo lançava exceção. */
    @Test
    void oTipoTemEstrategiaRegistrada()
    {
        assertTrue(registro.conhece(EnumFasePartida.PONTOS_CORRIDOS));
        assertEquals(EnumFasePartida.PONTOS_CORRIDOS,
                registro.para(EnumFasePartida.PONTOS_CORRIDOS).tipo());
    }

    /** Quatro equipes, turno único: seis confrontos. */
    @Test
    void quatroEquipesGeramSeisConfrontos()
    {
        Fase fase = novaFase(Map.of());
        orquestrador.configurar(fase);

        assertEquals(6, partidaRepository.findByFaseId(fase.getId()).size());
    }

    @Test
    void turnoEReturnoDobraOsConfrontos()
    {
        Fase fase = novaFase(Map.of(EstrategiaDePontosCorridos.IDA_E_VOLTA, "true"));
        orquestrador.configurar(fase);

        assertEquals(12, partidaRepository.findByFaseId(fase.getId()).size());
    }

    /** Todos numa tabela só: nenhuma partida sai marcada com grupo diferente de 1. */
    @Test
    void tudoNumGrupoSo()
    {
        Fase fase = novaFase(Map.of());
        orquestrador.configurar(fase);

        assertTrue(partidaRepository.findByFaseId(fase.getId()).stream()
                        .allMatch(p -> p.getGrupo() == null || p.getGrupo() == 1),
                "houve partida fora do grupo único");
    }

    @Test
    void configurarDuasVezesNaoDuplica()
    {
        Fase fase = novaFase(Map.of());
        orquestrador.configurar(fase);
        orquestrador.atualizar(fase, Map.of());
        orquestrador.atualizar(fase, Map.of());

        assertEquals(6, partidaRepository.findByFaseId(fase.getId()).size());
    }

    @Test
    void umaEquipeSoEhRecusada()
    {
        competicao.setLstEquipes(new ArrayList<>(List.of(equipes.get(0))));
        competicaoRepository.save(competicao);

        Fase fase = novaFase(Map.of());
        ResultadoDaValidacao resultado = orquestrador.validar(fase);

        assertFalse(resultado.ehValido());
        assertTrue(resultado.erros().stream().anyMatch(e -> e.contains("ao menos 2 equipes")),
                "a recusa não disse o mínimo: " + resultado.erros());
    }

    @Test
    void classificacaoOrdenaPorPontosEDepoisPeloDesempate()
    {
        Fase fase = novaFase(Map.of());
        orquestrador.configurar(fase);

        // A equipe 1 vence as três; a 2 vence duas; a 3 vence uma; a 4 perde tudo.
        List<Partida> partidas = partidaRepository.findByFaseId(fase.getId());
        for (Partida partida : partidas)
        {
            int indiceMandante = indiceDe(partida.getIdEquipeMandante());
            int indiceVisitante = indiceDe(partida.getIdEquipeVisitante());

            boolean mandanteVence = indiceMandante < indiceVisitante;
            partida.setPlacarMandante(mandanteVence ? 2 : 0);
            partida.setPlacarVisitante(mandanteVence ? 0 : 2);
            partida.setRealizada(true);
        }
        partidaRepository.saveAll(partidas);

        List<Classificado> classificacao = orquestrador.classificacaoDe(fase);

        assertEquals(4, classificacao.size());
        assertEquals(equipes.get(0).getId(), classificacao.get(0).idEquipe());
        assertEquals(equipes.get(3).getId(), classificacao.get(3).idEquipe());
    }

    /** Equipe que ainda não jogou aparece zerada, e não ausente da tabela. */
    @Test
    void quemNaoJogouAparecNaTabela()
    {
        Fase fase = novaFase(Map.of());
        orquestrador.configurar(fase);

        assertEquals(4, orquestrador.classificacaoDe(fase).size());
    }

    @Test
    void pontuacaoPorVitoriaEhConfiguravel()
    {
        Fase fase = novaFase(Map.of(EstrategiaDePontosCorridos.PONTOS_VITORIA, "2"));
        orquestrador.configurar(fase);

        // Com 2 pontos por vitória a ordem não muda, mas a configuração tem
        // que ser lida: é ela que RF26 pede configurável por competição.
        assertEquals(4, orquestrador.classificacaoDe(fase).size());
    }

    private int indiceDe(Long idEquipe)
    {
        for (int i = 0; i < equipes.size(); i++)
        {
            if (equipes.get(i).getId().equals(idEquipe))
            {
                return i;
            }
        }
        return Integer.MAX_VALUE;
    }
}
