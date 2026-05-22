package org.example.Models;

import java.util.ArrayList;
import java.util.List;

public class ConfigCampeonato {

    public TabelaCampeonato criarNovoCampeonato(Long id, String nome, EnumTipoEsporte esporte, List<Time> times, boolean ehMataMata) {
        List<EnumTipoEsporte> esportesPermitidos = new ArrayList<>();
        esportesPermitidos.add(esporte);

        Campeonato novoCampeonato = new Campeonato(
            id, 
            nome, 
            esportesPermitidos, 
            new ArrayList<>(),
            ehMataMata
        );

        for (Time time : times) {
            novoCampeonato.adicionarTime(time);
        }

        return new TabelaCampeonato(novoCampeonato);
    }

    public void editarDadosCampeonato(Campeonato campeonato, String novoNome, boolean novoTipoMataMata) {
        if (campeonato != null) {
            campeonato.setNome(novoNome);
            campeonato.setMataMata(novoTipoMataMata);
            System.out.println("Dados do campeonato atualizados com sucesso!");
        }
    }

    public void editarEsportes(Campeonato campeonato, List<EnumTipoEsporte> novosEsportes) {
        if (campeonato != null) {
            campeonato.setEnumTipoEsporte(novosEsportes);
        }
    }

    public void atualizarTimes(Campeonato campeonato, List<Time> novosTimes) {
        if (campeonato != null) {
            campeonato.getLstTimes().clear();
            for (Time time : novosTimes) {
                campeonato.adicionarTime(time);
            }
        }
    }

    public TabelaCampeonato regerarTabela(Campeonato campeonato) {
        System.out.println("Regerando tabela para o campeonato: " + campeonato.getNome());
        return new TabelaCampeonato(campeonato);
    }
}