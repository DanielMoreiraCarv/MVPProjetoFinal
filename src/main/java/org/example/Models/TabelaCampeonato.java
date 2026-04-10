package org.example.Models;

import org.example.Models.Partida;
import org.example.Models.Time;
import java.util.*;

public class TabelaCampeonato {
    private final Map<Long, Time> timesMap = new HashMap<>();
    private final List<Partida> todasAsPartidas = new ArrayList<>();
    private final Map<Long, Long> vinculoSucessor = new HashMap<>();
    private final Map<Long, List<Long>> origensPartida = new HashMap<>();

    public TabelaCampeonato(List<Time> listaDeTimes) {
        for (Time t : listaDeTimes) {
            this.timesMap.put(t.getId(), t);
        }
        if (!listaDeTimes.isEmpty()) {
            gerarEstruturaMataMata(new ArrayList<>(listaDeTimes));
        }
    }

    private void gerarEstruturaMataMata(List<Time> times) {
        long idContador = 1;
        List<Partida> faseAtual = new ArrayList<>();

        // 1. PRIMEIRA FASE (Ex: Quartas)
        for (int i = 0; i < times.size(); i += 2) {
            Partida p = new Partida(idContador++, times.get(i).getId(), times.get(i + 1).getId(),
                    1L, null, null, 0, 0);
            faseAtual.add(p);
        }
        todasAsPartidas.addAll(faseAtual);

        // 2. FASES SEGUINTES (Semis, Final...)
        while (faseAtual.size() > 1) {
            List<Partida> proximaFase = new ArrayList<>();
            for (int i = 0; i < faseAtual.size(); i += 2) {
                Partida pSucessora = new Partida(idContador++, null, null, 1L, null, null, 0, 0);

                long idAnt1 = faseAtual.get(i).getId();
                long idAnt2 = faseAtual.get(i + 1).getId();

                vinculoSucessor.put(idAnt1, pSucessora.getId());
                vinculoSucessor.put(idAnt2, pSucessora.getId());
                origensPartida.put(pSucessora.getId(), Arrays.asList(idAnt1, idAnt2));

                proximaFase.add(pSucessora);
            }
            todasAsPartidas.addAll(proximaFase);
            faseAtual = proximaFase;
        }
    }

    public void definirResultado(Long idPartida, int golsMandante, int golsVisitante) {
        Partida atual = todasAsPartidas.stream().filter(p -> p.getId().equals(idPartida)).findFirst().orElseThrow();
        atual.setResultadoMandante(golsMandante);
        atual.setResultadoVisitante(golsVisitante);

        // Vencedor (Empate favorece o mandante ou exija nova lógica de penaltis)
        Long vencedorId = (golsMandante >= golsVisitante) ? atual.getIdTimeMandante() : atual.getIdTimeVisitante();
        atual.setIdVencedor(vencedorId);

        // Avançar para a sucessora
        Long idProxima = vinculoSucessor.get(idPartida);
        if (idProxima != null) {
            Partida proxima = todasAsPartidas.stream().filter(p -> p.getId().equals(idProxima)).findFirst().get();
            List<Long> origens = origensPartida.get(idProxima);

            if (origens.get(0).equals(idPartida)) {
                proxima.setIdTimeMandante(vencedorId);
            } else {
                proxima.setIdTimeVisitante(vencedorId);
            }
        }
    }

    public void imprimirChaveamento() {
        System.out.println("\n========================================================");
        System.out.println("            CHAVEAMENTO COMPLETO DO TORNEIO             ");
        System.out.println("========================================================");

        for (Partida p : todasAsPartidas) {
            List<Long> origens = origensPartida.get(p.getId());

            String m = (p.getIdTimeMandante() != null) ? timesMap.get(p.getIdTimeMandante()).getNome()
                    : (origens != null ? "Vencedor do Jogo " + origens.get(0) : "???");

            String v = (p.getIdTimeVisitante() != null) ? timesMap.get(p.getIdTimeVisitante()).getNome()
                    : (origens != null ? "Vencedor do Jogo " + origens.get(1) : "???");

            String vencedor = p.getIdVencedor() != null ? "-> VENCEDOR: " + timesMap.get(p.getIdVencedor()).getNome() : "";

            System.out.printf("JOGO %d: %-25s [%d] x [%d] %-25s %s\n",
                    p.getId(), m, p.getResultadoMandante(), p.getResultadoVisitante(), v, vencedor);

            // Divisória estética para as fases
            if (p.getId() == 4) System.out.println("---------------------- SEMIFINAIS ----------------------");
            if (p.getId() == 6) System.out.println("------------------------- FINAL ------------------------");
        }
        System.out.println("========================================================\n");
    }
}