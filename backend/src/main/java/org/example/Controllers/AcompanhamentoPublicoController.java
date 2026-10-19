package org.example.Controllers;

import org.example.Mapper.CompeticaoMapper;
import org.example.Models.Response.AtletaResponse;
import org.example.Models.Response.ChaveamentoResponse;
import org.example.Models.Response.CompeticaoResponse;
import org.example.Models.Response.EquipeResponse;
import org.example.Models.Response.EstruturaResponse;
import org.example.Models.Response.LinhaDaTabelaResponse;
import org.example.Models.Response.PartidaResponse;
import org.example.Models.Response.SumulaResponse;
import org.example.Services.AcompanhamentoPublicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * As leituras do acompanhamento por link, sem login e só de competição aberta
 * ao público.
 *
 * Os caminhos espelham os da gestão com o prefixo `/publico`, e a resposta é
 * a mesma da rota interna — este controller confere a porta e delega —, para
 * as duas nunca divergirem. A diferença é o que fica de fora: CPF e idade de
 * atleta não saem por aqui. Muitas destas competições são de escola.
 *
 * Quando o login existir, a regra de segurança fica simples: `/publico/**`
 * liberado, todo o resto exige sessão.
 */
@RestController
@RequestMapping("/api/v1/publico")
public class AcompanhamentoPublicoController
{
    @Autowired
    private AcompanhamentoPublicoService porta;

    @Autowired
    private CompeticaoController competicoes;

    @Autowired
    private FaseController fases;

    @Autowired
    private PartidaController partidas;

    @Autowired
    private SumulaController sumulas;

    @Autowired
    private EquipeController equipes;

    @GetMapping("/competicao")
    public ResponseEntity<List<CompeticaoResponse>> listarAbertas ()
    {
        return ResponseEntity.ok( porta.listarAbertas().stream()
                .map( CompeticaoMapper::toResponse )
                .map( AcompanhamentoPublicoController::semDadosPessoais )
                .toList() );
    }

    @GetMapping("/competicao/{id}")
    public ResponseEntity<CompeticaoResponse> competicao ( @PathVariable Long id )
    {
        return ResponseEntity.ok( semDadosPessoais( CompeticaoMapper.toResponse( porta.exigirAberta( id ) ) ) );
    }

    @GetMapping("/competicao/{id}/estrutura")
    public ResponseEntity<EstruturaResponse> estrutura ( @PathVariable Long id )
    {
        porta.exigirAberta( id );
        return competicoes.estrutura( id );
    }

    @GetMapping("/fase")
    public ResponseEntity<?> fasesDaCompeticao ( @RequestParam Long idCompeticao )
    {
        porta.exigirAberta( idCompeticao );
        return fases.buscarFases( idCompeticao );
    }

    @GetMapping("/fase/{id}/tabela")
    public ResponseEntity<List<LinhaDaTabelaResponse>> tabela ( @PathVariable Long id )
    {
        porta.exigirFaseAberta( id );
        return fases.tabela( id );
    }

    @GetMapping("/fase/{id}/chaveamento")
    public ResponseEntity<ChaveamentoResponse> chaveamento ( @PathVariable Long id )
    {
        porta.exigirFaseAberta( id );
        return fases.chaveamento( id );
    }

    @GetMapping("/partida/competicao/{idCompeticao}")
    public ResponseEntity<List<PartidaResponse>> partidasDaCompeticao ( @PathVariable Long idCompeticao )
    {
        porta.exigirAberta( idCompeticao );
        return partidas.listarPorCompeticao( idCompeticao );
    }

    @GetMapping("/partida/{id}")
    public ResponseEntity<PartidaResponse> partida ( @PathVariable Long id )
    {
        porta.exigirPartidaAberta( id );
        return partidas.buscarPorId( id );
    }

    @GetMapping("/sumula/partida/{idPartida}")
    public ResponseEntity<SumulaResponse> sumulaDaPartida ( @PathVariable Long idPartida )
    {
        porta.exigirPartidaAberta( idPartida );
        return sumulas.buscarPorPartida( idPartida );
    }

    @GetMapping("/equipe/{id}/atleta")
    public ResponseEntity<List<AtletaResponse>> elenco ( @PathVariable Long id )
    {
        porta.exigirEquipeEmCompeticaoAberta( id );
        List<AtletaResponse> elenco = equipes.listarElenco( id ).getBody();
        return ResponseEntity.ok( elenco == null ? List.of()
                : elenco.stream().map( AcompanhamentoPublicoController::semDadosPessoais ).toList() );
    }

    private static AtletaResponse semDadosPessoais ( AtletaResponse atleta )
    {
        return new AtletaResponse( atleta.id(), atleta.nome(), null, atleta.numCamisa(), null,
                atleta.pontos(), atleta.gols(), atleta.assistencias() );
    }

    private static EquipeResponse semDadosPessoais ( EquipeResponse equipe )
    {
        return new EquipeResponse( equipe.id(), equipe.nome(), equipe.federacao(),
                equipe.atletas() == null ? null
                        : equipe.atletas().stream().map( AcompanhamentoPublicoController::semDadosPessoais ).toList(),
                equipe.modalidade() );
    }

    private static CompeticaoResponse semDadosPessoais ( CompeticaoResponse competicao )
    {
        return new CompeticaoResponse( competicao.id(), competicao.nome(), competicao.modalidades(),
                competicao.equipes() == null ? null
                        : competicao.equipes().stream().map( AcompanhamentoPublicoController::semDadosPessoais ).toList(),
                competicao.isMataMata(), competicao.descricao(), competicao.categoria(),
                competicao.idAdministracao(), competicao.estado(), competicao.publica() );
    }
}
