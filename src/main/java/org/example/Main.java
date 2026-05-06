package org.example;

import org.example.Models.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    static void main () {

        Jogadores jogador1A = new Jogadores( 1L, "Diego", 12, false );

        Jogadores jogador2A = new Jogadores( 2L, "Davi", 12, false );

        Jogadores jogador3A = new Jogadores( 3L, "Daniel", 12, false );

        Jogadores jogador4A = new Jogadores( 4L, "Douglas", 12, false );

        List<Jogadores> jogadoresA = new ArrayList<>();
        jogadoresA.add( jogador1A );
        jogadoresA.add( jogador2A );
        jogadoresA.add( jogador3A );
        jogadoresA.add( jogador4A );

        Jogadores jogador1B = new Jogadores( 1L, "Diego 2", 12, false );

        Jogadores jogador2B = new Jogadores( 2L, "Davi 2", 12, false );

        Jogadores jogador3B = new Jogadores( 3L, "Daniel 2", 12, false );

        Jogadores jogador4B = new Jogadores( 4L, "Douglas 2", 12, false );

        List<Jogadores> jogadoresB = new ArrayList<>();
        jogadoresB.add( jogador1B );
        jogadoresB.add( jogador2B );
        jogadoresB.add( jogador3B );
        jogadoresB.add( jogador4B );

        Time timeA1 =
                new Time( 11L, "Time A1", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeB1 =
                new Time( 21L, "Time B1", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Time timeC1 =
                new Time( 31L, "Time C1", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeD1 =
                new Time( 41L, "Time D1", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Time timeE1 =
                new Time( 51L, "Time E1", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeF1 =
                new Time( 61L, "Time F1", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Time timeG1 =
                new Time( 71L, "Time G1", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeH1 =
                new Time( 81L, "Time H1", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Time timeA =
                new Time( 1L, "Time A", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeB =
                new Time( 2L, "Time B", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Time timeC =
                new Time( 3L, "Time C", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeD =
                new Time( 4L, "Time D", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Time timeE =
                new Time( 5L, "Time E", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeF =
                new Time( 6L, "Time F", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Time timeG =
                new Time( 7L, "Time G", jogadoresA, EnumTipoEsporte.FUTEBOL );

        Time timeH =
                new Time( 8L, "Time H", jogadoresB, EnumTipoEsporte.FUTEBOL );

        Campeonato campeonato = new Campeonato( true );
        campeonato.setId( 1L );
        campeonato.setNome( "Campeonato teste" );
        List<EnumTipoEsporte> lstEnum = new ArrayList<>();
        lstEnum.add( EnumTipoEsporte.FUTEBOL );
        campeonato.setEnumTipoEsporte( lstEnum );
        campeonato.setLstTimes( new ArrayList<>() );
        campeonato.adicionarTime( timeA );
        campeonato.adicionarTime( timeB );

        System.out.println( campeonato.getNome() );

        // Supondo que você já tenha sua lista de objetos Time
        List<Time> meusTimes =
                Arrays.asList( timeA, timeB, timeC, timeD, timeE, timeF, timeG,
                        timeH );
        campeonato.setLstTimes( meusTimes );

        List<Time> timesTest =
                Arrays.asList( timeA, timeB, timeC, timeD, timeE, timeF,
                        timeG, timeH, timeA1, timeB1, timeC1, timeD1, timeE1,
                        timeF1, timeG1, timeH1 );

        TabelaCampeonato torneio = new TabelaCampeonato( campeonato );

        // Define o resultado do primeiro jogo das quartas
        torneio.definirResultado( 1L, 3, 1 );
        torneio.definirResultado( 2L, 3, 5 );

        // O vencedor do jogo 1 já estará automaticamente escalado na partida
        // de semifinal
        torneio.imprimirChaveamento();
        torneio.imprimirTodasAsPartidas();
        torneio.imprimirPartidasFaltantes();

        torneio.definirResultado( 3L, 8, 7 );
        torneio.imprimirChaveamento();
        torneio.imprimirTodasAsPartidas();
        torneio.imprimirPartidasFaltantes();

        //        System.out.println
        //        ("========================================================");
        //        System.out.println("           CAMPEONATO EM PONTOS
        //        CORRIDOS                ");
        //        System.out.println
        //        ("========================================================");
        //
        //        Campeonato campeonatoPontos = new Campeonato(false);
        //        campeonatoPontos.setId(2L);
        //        campeonatoPontos.setNome("Campeonato pontos corridos");
        //        campeonatoPontos.setEnumTipoEsporte(lstEnum);
        //        campeonatoPontos.setLstTimes(meusTimes);
        //
        //        TabelaCampeonato tabelaPontos = new TabelaCampeonato
        //        (campeonatoPontos);
        //        tabelaPontos.definirResultado(1L, 2, 1);
        //        tabelaPontos.definirResultado(2L, 0, 0);
        //        tabelaPontos.definirResultado(3L, 3, 2);
        //        tabelaPontos.imprimirChaveamento();
        //        tabelaPontos.imprimirTodasAsPartidas();
        //        tabelaPontos.imprimirPartidasFaltantes();
    }
}
