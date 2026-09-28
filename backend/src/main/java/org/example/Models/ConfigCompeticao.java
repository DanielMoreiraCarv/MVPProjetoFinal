package org.example.Models;

import java.util.ArrayList;
import java.util.List;

public class ConfigCompeticao {

    public TabelaCompeticao criarNovoCompeticao(Long id, String nome, Modalidade modalidade, List<Equipe> equipes, boolean ehMataMata) {
        List<Modalidade> modalidadesPermitidas = new ArrayList<>();
        modalidadesPermitidas.add(modalidade);

        Competicao novoCompeticao = new Competicao(
            id, 
            nome, 
            modalidadesPermitidas, 
            new ArrayList<>(),
            ehMataMata
        );

        for (Equipe equipe : equipes) {
            novoCompeticao.adicionarEquipe(equipe);
        }

        return new TabelaCompeticao(novoCompeticao);
    }

    public void editarDadosCompeticao(Competicao competicao, String novoNome, boolean novoTipoMataMata) {
        if (competicao != null) {
            competicao.setNome(novoNome);
            competicao.setMataMata(novoTipoMataMata);
            System.out.println("Dados da competição atualizados com sucesso!");
        }
    }

    public void editarModalidades(Competicao competicao, List<Modalidade> novasModalidades) {
        if (competicao != null) {
            competicao.setLstModalidades(novasModalidades);
        }
    }

    public void atualizarEquipes(Competicao competicao, List<Equipe> novosTimes) {
        if (competicao != null) {
            competicao.getLstEquipes().clear();
            for (Equipe equipe : novosTimes) {
                competicao.adicionarEquipe(equipe);
            }
        }
    }

    public TabelaCompeticao regerarTabela(Competicao competicao) {
        System.out.println("Regerando tabela para a competição: " + competicao.getNome());
        return new TabelaCompeticao(competicao);
    }
}