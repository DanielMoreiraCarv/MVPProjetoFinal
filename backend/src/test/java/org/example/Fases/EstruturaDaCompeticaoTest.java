package org.example.Fases;

import org.example.Models.Competicao;
import org.example.Models.EnumEstadoCompeticao;
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
import org.example.Services.FaseService;
import org.example.Services.PartidaService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A estrutura inteira validada antes de gerar qualquer partida, e gerada por
 * um botão só: a primeira fase na hora, as seguintes quando a anterior acaba.
 */
@SpringBootTest
@Transactional
class EstruturaDaCompeticaoTest
{
    @Autowired private OrquestradorDeFases orquestrador;
    @Autowired private FaseService faseService;
    @Autowired private PartidaService partidaService;
    @Autowired private FaseRepository faseRepository;
    @Autowired private PartidaRepository partidaRepository;
    @Autowired private CompeticaoRepository competicaoRepository;
    @Autowired private EquipeRepository equipeRepository;
    @Autowired private ModalidadeRepository modalidadeRepository;

    @BeforeAll
    static void exigirBancoNoAr ()
    {
        try ( Socket ignorado = new Socket( "localhost", 5433 ) )
        {
            // no ar
        }
        catch ( Exception falha )
        {
            throw new IllegalStateException( """
                    Postgres local indisponível em localhost:5433. Suba o ambiente antes de rodar os testes:
                      ./deploy/ambiente.sh subir""" );
        }
    }

    /** Oito equipes, grupos de 2 grupos que levam `porGrupo` cada a uma eliminatória. */
    private Fase[] gruposEEliminatoria ( String porGrupo )
    {
        Modalidade futebol = modalidadeRepository.findByCodigo( "FUTEBOL_DE_CAMPO" ).orElseThrow();
        List<Equipe> equipes = new ArrayList<>();
        for ( int i = 1; i <= 8; i++ )
        {
            Equipe equipe = new Equipe();
            equipe.setNome( "Equipe " + i );
            equipe.setModalidade( futebol );
            equipes.add( equipeRepository.save( equipe ) );
        }
        Competicao competicao = new Competicao();
        competicao.setNome( "Copa da estrutura" );
        competicao.setLstEquipes( equipes );
        competicao.setEstado( EnumEstadoCompeticao.RASCUNHO );
        competicao = competicaoRepository.save( competicao );

        Fase mataMata = new Fase();
        mataMata.setNome( "Mata-mata" );
        mataMata.setOrdem( 2 );
        mataMata.setFasePartida( EnumFasePartida.ELIMINATORIA );
        mataMata.setCompeticao( competicao );
        mataMata = faseRepository.save( mataMata );

        Fase grupos = new Fase();
        grupos.setNome( "Grupos" );
        grupos.setOrdem( 1 );
        grupos.setFasePartida( EnumFasePartida.GRUPOS );
        grupos.setCompeticao( competicao );
        grupos.setFaseSucessora( mataMata );
        grupos = faseRepository.save( grupos );
        orquestrador.definirAtributo( grupos, EstrategiaDeGrupos.NUMERO_DE_GRUPOS, "2" );
        orquestrador.definirAtributo( grupos, EstrategiaDeGrupos.CLASSIFICADOS_POR_GRUPO, porGrupo );
        return new Fase[] { grupos, mataMata };
    }

    @Test
    void totalQueNaoFechaAChaveEhRecusadoAntesDeGerarQualquerPartida ()
    {
        Fase[] fases = gruposEEliminatoria( "3" );   // 6 avançam: não fecha chave
        Long idCompeticao = fases[0].getCompeticao().getId();

        var estrutura = faseService.validarEstrutura( idCompeticao );
        assertTrue( estrutura.stream().anyMatch( v -> v.fase().getId().equals( fases[1].getId() ) && !v.resultado().ehValido() ),
                "a eliminatória só reprovava depois de os grupos acabarem" );

        IllegalArgumentException recusa = assertThrows( IllegalArgumentException.class,
                () -> faseService.gerarPartidasDaCompeticao( idCompeticao ) );
        assertTrue( recusa.getMessage().contains( "Mata-mata" ), recusa.getMessage() );
        assertTrue( partidaRepository.findByFaseId( fases[0].getId() ).isEmpty(),
                "nenhuma partida pode nascer de uma estrutura que não fecha" );
    }

    @Test
    void estruturaValidaGeraAPrimeiraFaseEPublica ()
    {
        Fase[] fases = gruposEEliminatoria( "2" );   // 4 avançam: semifinal
        Long idCompeticao = fases[0].getCompeticao().getId();

        assertTrue( faseService.validarEstrutura( idCompeticao ).stream().allMatch( v -> v.resultado().ehValido() ) );
        faseService.gerarPartidasDaCompeticao( idCompeticao );

        assertFalse( partidaRepository.findByFaseId( fases[0].getId() ).isEmpty() );
        assertTrue( partidaRepository.findByFaseId( fases[1].getId() ).isEmpty() );
        assertEquals( EnumEstadoCompeticao.EM_ANDAMENTO,
                competicaoRepository.findById( idCompeticao ).orElseThrow().getEstado() );
    }

    @Test
    void faseSeguinteEhGeradaQuandoAAnteriorTermina ()
    {
        Fase[] fases = gruposEEliminatoria( "2" );
        faseService.gerarPartidasDaCompeticao( fases[0].getCompeticao().getId() );

        int i = 0;
        for ( Partida partida : partidaRepository.findByFaseId( fases[0].getId() ) )
        {
            partidaService.definirResultado( partida.getId(), ( i * 7 ) % 4, ( i * 3 ) % 3 );
            i++;
        }

        assertEquals( 2, partidaRepository.findByFaseId( fases[1].getId() ).size(),
                "a semifinal esperava alguém gerar os confrontos dela à mão" );
    }
}
