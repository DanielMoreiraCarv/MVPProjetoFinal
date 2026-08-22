# Glossário Único de Domínio

**Projeto:** Plataforma de gestão de competições esportivas amadoras  
**Contexto:** Projeto Final Integrador II (UNIFOR)  
**Objetivo:** Unificar o vocabulário de negócios entre o Front-end e o Back-end, eliminando incompatibilidades estruturais (E01-E20) e estabelecendo as regras para o modelo de dados canônico (F0.3).

---

## 1. Diretrizes Gerais do Contrato

1. **Idioma Oficial da API e Banco de Dados:** **PT-BR** em toda a stack (nomes de tabelas, atributos, endpoints e payloads JSON). O Front-end deve abandonar o inglês e mapear seus schemas em conformidade com este glossário.
2. **Chaves de Relacionamento (IDs):** Todas as entidades serão relacionadas estritamente através de chaves primárias numéricas (`Long`), auto-incrementais (`IDENTITY` no banco relacional). Fica proibido o relacionamento lógico por "nome" ou strings livres de identificação no Front-end ou Back-end.
3. **Cálculos Centralizados:** Toda a lógica de classificação, chaveamento de eliminatórias, propagação de vencedores e geração automática de tabelas deve residir e ser executada **exclusivamente no servidor**. O Front-end atuará apenas como leitor e apresentador desses dados estruturados via API.

---

## 2. Dicionário de Entidades de Domínio

### 2.1. Administração (Anteriormente: *Tournament / Torneio*)
* **Conceito:** Nível máximo da hierarquia do sistema. Representa uma entidade organizacional (associação, empresa, universidade, liga) que promove e agrupa múltiplos campeonatos e competições sob sua gestão.
* **Resolução de Divergência (E01):** Criação da entidade no Back-end para suportar o fluxo de telas do Front-end de listagem e segmentação de competições por entidade administradora.

### 2.2. Competição (Anteriormente: *Campeonato / Competition / Tournament*)
* **Conceito:** O certame esportivo propriamente dito organizado pela Administração (ex: "Copa UNIFOR 2026 - Futebol Masculino"). Agrupa as equipes participantes, fases, jogos e classificação.
* **Atributos Essenciais:** 
  * `descricao`: Detalhamento textual da competição.
  * `modalidade`: Esporte associado (entidade própria, ex: Futebol, Futsal, Basquete).
  * `categoria`: Naipe (Masculino, Feminino, Misto) ou faixa etária.
  * `estado`: Rascunho, Em Andamento, Encerrada ou Cancelada.

### 2.3. Fase (Anteriormente: *CompetitionStage / mataMata*)
* **Conceito:** Subdivisão estrutural de uma Competição que define o formato de disputa temporário. Uma competição pode possuir múltiplas fases encadeadas (ex: Fase 1 = Grupos; Fase 2 = Quartas de Final; Fase 3 = Semifinal; Fase 4 = Final).
* **Resolução de Divergência (E06):** Substitui o booleano restrito `mataMata` no Back-end por uma entidade `Fase` capaz de suportar dinamicamente os formatos: *Pontos Corridos*, *Grupos* e *Eliminatórias (Mata-Mata)*.

### 2.4. Rodada (Round)
* **Conceito:** Agrupamento lógico de partidas que ocorrem de forma paralela ou concorrente dentro de uma Fase de pontos corridos ou de grupos, servindo para organizar o calendário temporal dos confrontos.

### 2.5. Partida (Anteriormente: *Match / Jogo*)
* **Conceito:** O confronto direto e agendado entre duas equipes esportivas.
* **Atributos Essenciais:** 
  * `dataHora`: Timestamp no formato ISO-8601 com fuso horário da região.
  * `local`: Identificação física da quadra, campo ou ginásio onde ocorrerá o evento.
  * `estado`: Agendada, Em Andamento ou Encerrada.
  * `timeMandante` / `timeVisitante`: Chaves numéricas (IDs) que referenciam as equipes.
  * `golsMandante` / `golsVisitante`: Placar oficial quantitativo de cada período.

### 2.6. Equipe (Anteriormente: *Time / Team*)
* **Conceito:** A unidade coletiva inscrita na competição, composta por atletas e comissão técnica, que disputa as partidas. Uma equipe herda a modalidade esportiva definida na competição em que está inscrita.

### 2.7. Atleta (Anteriormente: *Jogador / Player*)
* **Conceito:** Pessoa física vinculada a uma Equipe participante de uma Competição.
* **Atributos Essenciais:** 
  * `dataNascimento`: Data de nascimento em formato ISO (eliminando o campo dinâmico de idade que sofre depreciação de tempo).
  * `documento`: Identificação única (CPF ou RG) para evitar duplicidade de inscrição.
  * `posicao`: Função preferencial ou tática em campo.
  * `numeroCamisa`: Identificador numérico do atleta que deve ser único dentro de sua equipe para aquela partida.

### 2.8. Súmula (Match Sheet)
* **Conceito:** Documento eletrônico oficial gerado por partida que atesta as ocorrências e o resultado definitivo do confronto. Para ser considerada encerrada, deve receber validação formal (assinatura digital) de três partes: o árbitro/mesário e um representante de cada equipe envolvida.

### 2.9. Evento (Anteriormente: *Ocorrências / List<String>*)
* **Conceito (O Coração do TCC):** Registro individual e estruturado de qualquer ação relevante ocorrida no tempo regulamentar da partida. Substitui as ocorrências em texto livre, permitindo o cálculo matemático automatizado de classificações, estatísticas e aplicação de suspensões.
* **Atributos Essenciais:**
  * `tipoEvento`: Gols/Pontos, Cartão Amarelo, Cartão Vermelho, Substituição ou Faltas Técnicas.
  * `atleta`: ID do atleta envolvido.
  * `equipe`: ID da equipe do atleta.
  * `minuto`: Minuto de jogo em que ocorreu o fato.
  * `periodo`: Indicação do período (1º Tempo, 2º Tempo, Prorrogação, etc.).

### 2.10. Escalação (Lineup)
* **Conceito:** Relação oficial dos atletas de uma equipe designados para uma partida específica, divididos formalmente entre titulares e reservas, validada antes do início do jogo pelo mesário.

### 2.11. Sanção (Sanction / Suspensão)
* **Conceito:** Penalidade administrativa aplicada a um Atleta decorrente de eventos acumulados na partida ou na competição (ex: expulsão direta ou acúmulo de cartões amarelos). A sanção gera o estado temporário de *Suspensão*, impedindo a escalação do Atleta na partida subsequente.

### 2.12. Árbitro / Mesário (Referee / Match Official)
* **Conceito:** Autoridade delegada pela Administração para mediar a partida (Árbitro) ou registrar digitalmente os eventos na Súmula em tempo real (Mesário).
