package org.example;

import org.example.Models.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    static void main() {
        //TIP Press <shortcut actionId="ShowIntentionActions"/> with your caret at the highlighted text
        // to see how IntelliJ IDEA suggests fixing it.
        System.out.println(String.format("Hello and welcome!"));

        Jogadores jogador1A = new Jogadores(1L,"Diego",12,false);

        Jogadores jogador2A = new Jogadores(2L,"Davi",12,false);

        Jogadores jogador3A = new Jogadores(3L,"Daniel",12,false);

        Jogadores jogador4A = new Jogadores(4L,"Douglas",12,false);

        List<Jogadores> jogadoresA = new ArrayList<>();
        jogadoresA.add(jogador1A);
        jogadoresA.add(jogador2A);
        jogadoresA.add(jogador3A);
        jogadoresA.add(jogador4A);

        Jogadores jogador1B = new Jogadores(1L,"Diego 2",12,false);

        Jogadores jogador2B = new Jogadores(2L,"Davi 2",12,false);

        Jogadores jogador3B = new Jogadores(3L,"Daniel 2",12,false);

        Jogadores jogador4B = new Jogadores(4L,"Douglas 2",12,false);

        List<Jogadores> jogadoresB = new ArrayList<>();
        jogadoresA.add(jogador1B);
        jogadoresA.add(jogador2B);
        jogadoresA.add(jogador3B);
        jogadoresA.add(jogador4B);

        Time timeA = new Time(1L,"Time A",jogadoresA ,EnumTipoEsporte.FUTEBOL);

        Time timeB = new Time(2L,"Time B",jogadoresB ,EnumTipoEsporte.FUTEBOL);

        Time timeC = new Time(3L,"Time C",jogadoresA ,EnumTipoEsporte.FUTEBOL);

        Time timeD = new Time(4L,"Time D",jogadoresB ,EnumTipoEsporte.FUTEBOL);

        Time timeE = new Time(5L,"Time E",jogadoresA ,EnumTipoEsporte.FUTEBOL);

        Time timeF = new Time(6L,"Time F",jogadoresB ,EnumTipoEsporte.FUTEBOL);

        Time timeG = new Time(7L,"Time G",jogadoresA ,EnumTipoEsporte.FUTEBOL);

        Time timeH = new Time(8L,"Time H",jogadoresB ,EnumTipoEsporte.FUTEBOL);

        Campeonato campeonato = new Campeonato();
        campeonato.setId(1L);
        campeonato.setNome("Campeonato teste");
        List<EnumTipoEsporte> lstEnum = new ArrayList<>();
        lstEnum.add(EnumTipoEsporte.FUTEBOL);
        campeonato.setEnumTipoEsporte(lstEnum);
        campeonato.setLstTimes(new ArrayList<>());
        campeonato.adicionarTime(timeA);
        campeonato.adicionarTime(timeB);

        System.out.println(campeonato.getNome());

        // Supondo que você já tenha sua lista de objetos Time
        List<Time> meusTimes = Arrays.asList(timeA, timeB, timeC,timeD,timeE,timeF,timeG,timeH);;

        TabelaCampeonato torneio = new TabelaCampeonato(meusTimes);

        // Define o resultado do primeiro jogo das quartas
        torneio.definirResultado(1L, 3, 1);

        // O vencedor do jogo 1 já estará automaticamente escalado na partida de semifinal
        torneio.imprimirChaveamento();


    }
}
