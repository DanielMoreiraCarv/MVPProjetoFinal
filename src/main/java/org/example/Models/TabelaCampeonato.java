package org.example.Models;

import org.example.Models.Partida;
import org.example.Models.Time;
import java.util.*;

public class TabelaCampeonato {
    private final Map<Long, Time> timesMap = new HashMap<>();
    private final List<Partida> todasAsPartidas = new ArrayList<>();
    private final List<List<Partida>> rondas = new ArrayList<>();
    private final Map<Long, Long> vinculoSucessor = new HashMap<>();
    private final Map<Long, List<Long>> origensPartida = new HashMap<>();
    private final Map<Long, Pontuacao> pontosCorridos = new HashMap<>();
    private final boolean pontosCorridosMode;

    public TabelaCampeonato(List<Time> listaDeTimes) {
        this(listaDeTimes, true);
    }

    public TabelaCampeonato(List<Time> listaDeTimes, boolean mataMata) {
        this.pontosCorridosMode = !mataMata;
        for (Time t : listaDeTimes) {
            this.timesMap.put(t.getId(), t);
        }
        if (!listaDeTimes.isEmpty()) {
            if (pontosCorridosMode) {
                gerarTabelaPontosCorridos(new ArrayList<>(listaDeTimes));
            } else {
                gerarEstruturaMataMata(new ArrayList<>(listaDeTimes));
            }
        }
    }

    public TabelaCampeonato(Campeonato campeonato) {
        if (campeonato == null) {
            throw new IllegalArgumentException("Campeonato não pode ser null");
        }

        List<Time> listaDeTimes = campeonato.getLstTimes() == null ? Collections.emptyList() : campeonato.getLstTimes();
        for (Time t : listaDeTimes) {
            this.timesMap.put(t.getId(), t);
        }

        this.pontosCorridosMode = !campeonato.isMataMata();

        if (!listaDeTimes.isEmpty()) {
            if (pontosCorridosMode) {
                gerarTabelaPontosCorridos(new ArrayList<>(listaDeTimes));
            } else {
                gerarEstruturaMataMata(new ArrayList<>(listaDeTimes));
            }
        }
    }

    private void gerarTabelaPontosCorridos(List<Time> times) {
        long idContador = 1;
        for (int i = 0; i < times.size(); i++) {
            pontosCorridos.put(times.get(i).getId(), new Pontuacao(times.get(i).getId(), times.get(i).getNome()));
            for (int j = i + 1; j < times.size(); j++) {
                Partida partida = new Partida(idContador++, times.get(i).getId(), times.get(j).getId(),
                        1L, null, null, 0, 0);
                todasAsPartidas.add(partida);
            }
        }
    }

    private void gerarEstruturaMataMata(List<Time> times) {
        if (!isPowerOfTwo(times.size())) {
            throw new IllegalArgumentException("Número de times deve ser potência de 2 para mata-mata.");
        }

        long idContador = 1;
        List<Partida> faseAtual = new ArrayList<>();

        for (int i = 0; i < times.size(); i += 2) {
            Partida p = new Partida(idContador++, times.get(i).getId(), times.get(i + 1).getId(),
                    1L, null, null, 0, 0);
            faseAtual.add(p);
        }
        todasAsPartidas.addAll(faseAtual);
        rondas.add(faseAtual);

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
            rondas.add(proximaFase);
            faseAtual = proximaFase;
        }
    }

    private boolean isPowerOfTwo(int value) {
        return value > 0 && (value & (value - 1)) == 0;
    }

    public void definirResultado(Long idPartida, int golsMandante, int golsVisitante) {
        Partida atual = todasAsPartidas.stream()
                .filter(p -> p.getId().equals(idPartida))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Partida " + idPartida + " não encontrada no chaveamento."));

        atual.setResultadoMandante(golsMandante);
        atual.setResultadoVisitante(golsVisitante);
        atual.setRealizada(true);

        if (pontosCorridosMode) {
            atualizarPontuacaoPontosCorridos(atual);
            return;
        }

        // Vencedor (Empate favorece o mandante ou exija nova lógica de penaltis)
        Long vencedorId = (golsMandante >= golsVisitante) ? atual.getIdTimeMandante() : atual.getIdTimeVisitante();
        atual.setIdVencedor(vencedorId);

        // Avançar para a sucessora
        Long idProxima = vinculoSucessor.get(idPartida);
        if (idProxima != null) {
            Partida proxima = todasAsPartidas.stream()
                    .filter(p -> p.getId().equals(idProxima))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Partida sucessora " + idProxima + " não encontrada."));
            List<Long> origens = origensPartida.get(idProxima);

            if (origens.get(0).equals(idPartida)) {
                proxima.setIdTimeMandante(vencedorId);
            } else {
                proxima.setIdTimeVisitante(vencedorId);
            }
        }
    }

    public void imprimirChaveamento() {
        if (pontosCorridosMode) {
            imprimirTabelaPontosCorridos();
            return;
        }

        System.out.println("\n========================================================");
        System.out.println("            CHAVEAMENTO COMPLETO DO TORNEIO             ");
        System.out.println("========================================================");

        int rodada = 1;
        for (List<Partida> fase : rondas) {
            System.out.println("\n---------- RODADA " + rodada + " ----------");
            fase.forEach(p -> {
                List<Long> origens = origensPartida.get(p.getId());
                String m = (p.getIdTimeMandante() != null) ? timesMap.get(p.getIdTimeMandante()).getNome()
                        : (origens != null ? "Vencedor do Jogo " + origens.get(0) : "???");
                String v = (p.getIdTimeVisitante() != null) ? timesMap.get(p.getIdTimeVisitante()).getNome()
                        : (origens != null ? "Vencedor do Jogo " + origens.get(1) : "???");
                String vencedor = p.getIdVencedor() != null ? "-> VENCEDOR: " + timesMap.get(p.getIdVencedor()).getNome() : "";
                System.out.printf("JOGO %d: %-25s [%d] x [%d] %-25s %s\n",
                        p.getId(), m, p.getResultadoMandante(), p.getResultadoVisitante(), v, vencedor);
            });
            rodada++;
        }

        System.out.println("========================================================\n");
    }

    public void imprimirTodasAsPartidas() {
        System.out.println("\n========================================================");
        System.out.println("                  TODAS AS PARTIDAS                    ");
        System.out.println("========================================================");
        todasAsPartidas.stream()
                .forEach(this::imprimirPartidaDetalhada);
        System.out.println("========================================================\n");
    }

    public void imprimirPartidasFaltantes() {
        System.out.println("\n========================================================");
        System.out.println("               PARTIDAS AINDA ACONTECER                  ");
        System.out.println("========================================================");
        todasAsPartidas.stream()
                .filter(p -> !p.isRealizada())
                .forEach(this::imprimirPartidaDetalhada);
        System.out.println("========================================================\n");
    }

    private void imprimirPartidaDetalhada(Partida p) {
        String mandante = p.getIdTimeMandante() != null ? timesMap.get(p.getIdTimeMandante()).getNome() : "???";
        String visitante = p.getIdTimeVisitante() != null ? timesMap.get(p.getIdTimeVisitante()).getNome() : "???";
        String resultado = p.isRealizada() ? String.format("%d x %d", p.getResultadoMandante(), p.getResultadoVisitante()) : "PENDENTE";
        System.out.printf("JOGO %d: %-25s vs %-25s  %s\n", p.getId(), mandante, visitante, resultado);
    }

    private void imprimirTabelaPontosCorridos() {
        System.out.println("\n========================================================");
        System.out.println("               TABELA DE PONTOS CORRIDOS                ");
        System.out.println("========================================================");
        System.out.printf("%-25s %5s %5s %5s %5s %5s %5s %5s\n", "Time", "P", "J", "V", "E", "D", "GP", "GC");

        pontosCorridos.values().stream()
                .sorted(Comparator.comparingInt(Pontuacao::getPontos).reversed()
                        .thenComparingInt(Pontuacao::getSaldoGols).reversed()
                        .thenComparing(Pontuacao::getNome))
                .forEach(entry -> System.out.printf("%-25s %5d %5d %5d %5d %5d %5d %5d\n",
                        entry.getNome(), entry.getPontos(), entry.getJogos(), entry.getVitorias(),
                        entry.getEmpates(), entry.getDerrotas(), entry.getGolsPro(), entry.getGolsContra()));

        System.out.println("========================================================\n");
    }

    private void atualizarPontuacaoPontosCorridos(Partida partida) {
        Pontuacao mandante = pontosCorridos.get(partida.getIdTimeMandante());
        Pontuacao visitante = pontosCorridos.get(partida.getIdTimeVisitante());
        if (mandante == null || visitante == null) {
            throw new IllegalStateException("Pontuação não inicializada para um dos times da partida.");
        }
        mandante.registrarPartida(partida.getResultadoMandante(), partida.getResultadoVisitante());
        visitante.registrarPartida(partida.getResultadoVisitante(), partida.getResultadoMandante());
    }

    private static class Pontuacao {
        private final Long timeId;
        private final String nome;
        private int pontos;
        private int jogos;
        private int vitorias;
        private int empates;
        private int derrotas;
        private int golsPro;
        private int golsContra;

        public Pontuacao(Long timeId, String nome) {
            this.timeId = timeId;
            this.nome = nome;
        }

        public void registrarPartida(int golsFeitos, int golsSofridos) {
            this.jogos++;
            this.golsPro += golsFeitos;
            this.golsContra += golsSofridos;
            if (golsFeitos > golsSofridos) {
                this.vitorias++;
                this.pontos += 3;
            } else if (golsFeitos == golsSofridos) {
                this.empates++;
                this.pontos += 1;
            } else {
                this.derrotas++;
            }
        }

        public String getNome() {
            return nome;
        }

        public int getPontos() {
            return pontos;
        }

        public int getJogos() {
            return jogos;
        }

        public int getVitorias() {
            return vitorias;
        }

        public int getEmpates() {
            return empates;
        }

        public int getDerrotas() {
            return derrotas;
        }

        public int getGolsPro() {
            return golsPro;
        }

        public int getGolsContra() {
            return golsContra;
        }

        public int getSaldoGols() {
            return golsPro - golsContra;
        }
    }
}