# Redesign do Front-end — plano da sprint

> **Estado: entregue.** O que segue é o plano como foi escrito, com o registro
> do que mudou na execução. O relatório do que de fato ficou pronto, e dos
> defeitos que a reescrita revelou, está em
> [`o-que-a-sprint-revelou.md`](o-que-a-sprint-revelou.md).

Reescrita integral da camada de interface do `frontend/`, mantendo e ampliando a
camada de dados (`src/lib/api/`). Pressuposto desta sprint: **usuário único** —
não há login, sessão nem papéis; o lugar deles na interface fica reservado, mas
vazio.

A validação é visual: o ambiente local sobe com `./deploy/ambiente.sh subir` e
cada PR é conferido na tela. Por isso a pilha é longa de propósito — muitos PRs
pequenos, cada um com uma coisa para olhar.

O plano tem quatro partes:

1. **Auditoria da API** — o que falta no back-end para que cada tela feche o
   ciclo (criar, ler, editar, remover).
2. **Vocabulário** — o renome que alinha código, banco e rotas ao glossário, e
   que vem **antes de tudo**.
3. **Linguagem visual e arquitetura de navegação** — o que é construído uma vez
   e todas as telas reusam.
4. **Pilha de PRs** — uma ou duas entregas por página, em ordem de dependência,
   terminando no construtor de competição personalizada.

---

# Parte 1 — Auditoria da API

## 1.1 O padrão: o service tem, o controller não expõe

O achado mais repetido da auditoria não é ausência de lógica, é ausência de
rota. Estes métodos já existem e compilam — mas **nenhum controller os chama**,
então o front não tem como alcançá-los:

| Service | Método existente | Rota que falta |
|---|---|---|
| `CampeonatoService` | `adicionarTimeAoCampeonato(id, time)` | `POST /competicao/{id}/equipe/{idEquipe}` |
| `CampeonatoService` | `removerTimeDoCapeonato(id, time)` *(typo no nome)* | `DELETE /competicao/{id}/equipe/{idEquipe}` |
| `CampeonatoService` | `listarMataMata()` / `listarPontosCorridos()` | filtro em `GET /competicao` |
| `TimeService` | `adicionarJogadorAoTime(idTime, jogador)` | `POST /equipe/{id}/atleta/{idAtleta}` |
| `TimeService` | `removerJogadorDoTime(idTime, idJogador)` | `DELETE /equipe/{id}/atleta/{idAtleta}` |
| `TimeService` | `listarJogadoresDoTime(idTime)` | `GET /equipe/{id}/atleta` |
| `TimeService` | `listarPorModalidade(idModalidade)` | filtro `?idModalidade=` em `GET /equipe` |
| `FaseService` | `buscarFasePorCampeonato(idCampeonato)` | filtro `?idCompeticao=` em `GET /fase` |
| `OrquestradorDeFases` | `definirAtributo(fase, codigo, valor)` | `PUT /fase/{id}/atributo/{codigo}` |
| `FederacaoService` | só `buscarPorId` — mas entidade, repositório, mapper, DTOs e exceptions prontos | **controller inteiro e o resto do CRUD** |
| `AtributoFaseRepository` | `findByTipoFase(tipo)` | `GET /fase/atributo?tipoFase=` |
| `TabelaService` | `buscarPorCampeonato`, `listarPartidas` | escritas não expostas |

Duas consequências diretas do que você notou:

- **Remover uma equipe de uma competição é impossível hoje.** O único caminho é
  `PUT /campeonato/{id}` com a lista `timesIds` inteira — leitura, alteração e
  escrita no cliente. Além de frágil (duas abas abertas, uma sobrescreve a
  outra), um `PUT` sem `timesIds` **apaga todas as equipes** da competição.
- **Listar as fases de uma competição é impossível hoje.** `GET /fase` devolve
  todas as fases de todas as competições. A tela da competição não tem como
  pedir só as suas.

## 1.2 Rotas que aceitam a entidade JPA como corpo

`PartidaController.criar`, `PartidaController.atualizar`, `SumulaController.criar`
e `SumulaController.atualizar` recebem `@RequestBody Partida` / `Sumula` — a
entidade, com `Time`, `Campeonato`, `Fase`, `Arbitro` aninhados. Na prática o
front não consegue montar esse corpo, e se montar está acoplado ao mapeamento
JPA. `PartidaUpdateRequest` **já existe** em `Models/Request/` e não é usado por
ninguém. Falta `PartidaCreateRequest`, `SumulaCreateRequest` e
`SumulaUpdateRequest`.

Sem isso, nenhuma tela de partida ou súmula fecha o ciclo de escrita.

## 1.3 Rotas que ignoram o id do caminho

`PUT /arbitro`, `PUT /time`, `PUT /fase` e `PUT /jogador` recebem o id **no
corpo**, não no path. `PUT /campeonato/{id}` e `PUT /administracao/{id}` recebem
no path. Duas convenções no mesmo `/api/v1`. Padronizar em `PUT /recurso/{id}`
— entra junto com o renome, já que os dois mexem nas mesmas assinaturas.

## 1.4 Campos do domínio que não existem no banco

| Falta | Onde dói | Requisito |
|---|---|---|
| `Partida.dataHora` e `Partida.local` | a tela de calendário não tem o que ordenar nem exibir; o agendamento não existe | RF58 (Essencial) |
| Estado da partida (`AGENDADA` / `EM_ANDAMENTO` / `ENCERRADA`) | hoje é o booleano `realizada`; não há "em andamento" para a súmula operar | RF71 (Essencial) |
| Estado da competição (`RASCUNHO` / `EM_ANDAMENTO` / `ENCERRADA` / `CANCELADA`) | não há como esconder uma competição inacabada nem bloquear edição de uma encerrada | RF18 (Essencial) |
| Entidade `Evento` | `Sumula.ocorrencias` é `List<String>` (`"9' - Gol de João..."`). Não sustenta artilharia, cartões nem recálculo | RF73, RF76 — **núcleo do TCC** |
| `Escalacao` | não há titulares/reservas | RF67, RF68 |

**`dataHora` e `local` entram nesta sprint** — são duas colunas e uma migração,
e sem elas a página de calendário não tem conteúdo. **O estado da competição
também entra**, porque o construtor de competição (Parte 4, trilho E) precisa de
`RASCUNHO` para deixar montar a estrutura antes de publicar.

`Evento`, `Escalacao` e o estado da partida **ficam fora**: são o escopo da Fase
2/3 do backlog, com motor de cálculo e recálculo em cascata atrás. A tela de
súmula desta sprint exibe e edita o que o modelo atual comporta (placar,
árbitro, ocorrência como texto, assinatura), preparada para receber `Evento`
depois.

## 1.5 Lacunas do motor de fases

O back-end já tem o substrato certo para competições de formato misto:
`EstrategiaDeFase` é um contrato cuja entrada e saída são a mesma coisa (uma
classificação), o que permite encadear fases de tipos diferentes sem que uma
conheça a outra; `OrquestradorDeFases` liga a saída de uma na entrada da
seguinte; `AtributoFase` / `ValorAtributoFase` guardam a configuração por
instância de fase; `RegistroDeEstrategias` resolve a estratégia pelo tipo.

Três lacunas nesse motor, todas necessárias para o construtor:

1. **`PONTOS_CORRIDOS` não tem estratégia.** `EnumFasePartida` declara três
   tipos e a pasta `Fases/` tem duas implementações: `EstrategiaDeGrupos`
   (`GRUPOS`) e `EstrategiaDeMataMata` (`ELIMINATORIA`).
   `RegistroDeEstrategias.para(PONTOS_CORRIDOS)` **lança exceção**. É o formato
   mais comum em competição amadora e é o que falta.
2. **Os atributos de cada tipo não são consultáveis por HTTP.**
   `AtributoFaseRepository.findByTipoFase` existe, e cada estratégia declara
   `atributosSuportados()` com código, tipo de dado, obrigatoriedade, valor
   padrão e descrição. Sem uma rota que devolva isso, o formulário de
   configuração de fase tem que ter os campos escritos à mão por tipo — que é
   exatamente o que o modelo de atributos existe para evitar.
3. **Gravar um atributo não é possível.** `OrquestradorDeFases.definirAtributo`
   não tem rota.

Com esses três resolvidos, o construtor é uma tela sobre o motor que já existe,
não um motor novo.

## 1.6 Divergências entre o padrão documentado e o código

`documentos/padrao-api.md` e `documentos/glossario.md` estabelecem coisas que o
código não faz:

| Padrão documentado | Realidade | Nesta sprint |
|---|---|---|
| Vocabulário do glossário (`competicao`, `equipe`, `atleta`) | `campeonato`, `time`, `jogadores` | **sim — trilho 0** |
| Recurso no singular | `/partidas` e `/sumulas` no plural | **sim — trilho 0** |
| URIs em `snake_case` | ok (rotas de uma palavra) | — |
| Envelope `{ "erro": { codigo, mensagem, detalhes } }` em 4xx/5xx | `catch (Exception e) → badRequest().build()`, sem corpo | **sim — B1** |
| Envelope `{ "resultado": ... }` em toda resposta 2xx | controllers devolvem o DTO cru | não |

O envelope de sucesso fica fora: mexe em todas as rotas e em todos os parsers
Zod de uma vez, e o ganho é consistência, não função — nenhuma tela consome a
diferença. O **contrato de erro**, ao contrário, é o único item que a interface
consome de verdade: é o que permite mostrar "o visitante deve ser diferente do
mandante" em vez de "a requisição falhou (HTTP 400)". `padrao-api.md` ganha uma
nota dizendo que o envelope de sucesso segue pendente.

## 1.7 Outros pontos

- `@CrossOrigin(origins = "*")` repetido em todos os controllers → configuração
  central de CORS.
- Ciclo `Partida ↔ Sumula` na serialização: `GET /partidas/{id}` de partida com
  súmula pode estourar `StackOverflowError`. As rotas que devolvem
  `PartidaResponse` estão a salvo; as que devolvem `Partida` cru
  (`/acompanhamento/{status}`, `POST`, `PUT`, `finalizar`, `escalar-arbitro`)
  não.
- `SancaoController` expõe dois recursos no mesmo controller, um deles em
  `/sancao/sancao`, com `DELETE /sancao/inativar/{id}` e
  `DELETE /sancao/deletar/{id}` lado a lado. Separar em `/sancao` e
  `/sancao_atleta`, e inativação é `PUT`, não `DELETE`.
- Nenhum `listarTodos` tem paginação. Com 96 equipes e 1440 atletas nos dados de
  teste, `GET /jogador` devolve 1440 registros. As telas sempre filtram por
  equipe, então dá para viver com isso nesta sprint.

## 1.8 Consolidado do que a API precisa ganhar

**Bloqueia página (entra na sprint):**

1. `POST` / `DELETE /competicao/{id}/equipe/{idEquipe}` — inscrever e remover.
2. Filtro `?idCompeticao=` em `GET /fase`.
3. `GET /equipe/{id}/atleta`, `POST` / `DELETE /equipe/{id}/atleta/{idAtleta}`.
4. `FederacaoController` (CRUD) — `Equipe` exige federação e não há como
   cadastrar.
5. `PartidaCreateRequest` / uso do `PartidaUpdateRequest`.
6. `SumulaCreateRequest` / `SumulaUpdateRequest`.
7. `Partida.dataHora` + `Partida.local` (migração + DTOs + agendamento).
8. `Competicao.estado` (migração + transições validadas).
9. `@ControllerAdvice` com o contrato de erro.
10. Quebrar o ciclo `Partida ↔ Sumula` nas rotas que devolvem a entidade crua.
11. `EstrategiaDePontosCorridos`.
12. `GET /fase/atributo?tipoFase=` e `PUT /fase/{id}/atributo/{codigo}`.

**Melhora consistência (entra junto com o renome):**

13. `PUT /recurso/{id}` uniforme nas quatro rotas divergentes.
14. Filtros `?idModalidade=` em `GET /equipe` e de formato em `GET /competicao`.
15. Separar `SancaoController` em dois recursos.
16. CORS centralizado.

**Registrado, fora da sprint:** envelope de resposta de sucesso, paginação,
`Evento`, `Escalacao`, estado da partida, autenticação.

---

# Parte 2 — Vocabulário

Vem primeiro, antes de qualquer tela. É mecânico, toca quase todo arquivo, e
qualquer coisa feita antes dele nasce para ser reescrita.

## 2.1 O mapa do renome

Duas coisas, e só estas duas:

1. **O vocabulário do glossário** — `campeonato` → `competicao`, `time` →
   `equipe`, `jogadores` → `atleta`.
2. **A convenção de chave estrangeira do MER** — `<entidade>_id`, uniforme. Hoje
   o esquema tem `id_campeonato` em um lugar, `arbitro_id` em outro e `team_id`
   em inglês num terceiro. `documentos/mer-der.md` usa `<entidade>_id` em todas
   as suas chaves, então é para lá que o esquema converge, em vez de inventar
   uma terceira convenção.

**Fora do renome:** as colunas que divergem do MER por outro motivo
(`fase.tipo_fase` contra `formato`, `partida.enum_fase_partida`, que o MER não
tem porque o formato vive na fase). Essas são convergência de *modelo*, não de
nome, e pertencem às fases 2 e 3 do backlog junto com `evento`, `escalacao` e as
máquinas de estado.

Do glossário, com o que existe hoje à esquerda:

| Hoje | Passa a ser | Alcance |
|---|---|---|
| `Campeonato` | `Competicao` | entidade, repositório, service, controller, DTOs, mapper, testes |
| `Time` | `Equipe` | idem — e `time` é palavra reservada em SQL, o renome resolve isso de graça |
| `Jogadores` | `Atleta` | idem (e sai do plural) |
| `SancaoJogador` | `SancaoAtleta` | idem |
| `EnumTipoEsporte` | mantém | já é `Modalidade` como entidade |
| tabela `campeonato` | `competicao` | migração |
| tabela `campeonato_modalidades` | `competicao_modalidade` | migração |
| tabela `campeonato_times` | `competicao_equipe` | migração |
| tabela `time` | `equipe` | migração — e `time` é palavra reservada em SQL |
| tabela `jogadores` | `atleta` | migração |
| tabela `team_players` | `equipe_atleta` | migração — está em inglês |
| tabela `sancao_jogador` | `sancao_atleta` | migração |
| toda FK `id_<x>` e `<x>_id` misturadas | `<entidade>_id` | migração |
| `partida.resultado_*` e `sumula.gols_*` | `placar_mandante` / `placar_visitante` | migração — placar não é gol em basquete nem em vôlei, e passa a ser o mesmo nome nos dois lugares |
| `modalidade.jogadores_em_quadra` | `atletas_em_quadra` | migração (e a linha correspondente do MER) |
| `sancao_atleta.excao`, `sumula.observacoes_relatas` | `excecao`, `observacoes_relatadas` | migração — erros de digitação |
| `/api/v1/campeonato` | `/api/v1/competicao` | rota |
| `/api/v1/time` | `/api/v1/equipe` | rota |
| `/api/v1/jogador` | `/api/v1/atleta` | rota |
| `/api/v1/partidas` | `/api/v1/partida` | rota (singular) |
| `/api/v1/sumulas` | `/api/v1/sumula` | rota (singular) |
| campo `timesIds` | `equipesIds` | DTO |
| campo `idTime`, `idTimeMandante` | `idEquipe`, `idEquipeMandante` | DTO e coluna |
| front: `Competition`, `Team`, `Player`, `Tournaments` | `Competicao`, `Equipe`, `Atleta`, `Administracao` | schemas Zod, tipos, módulos de API |
| front: `times.ts` | `equipes.ts` | módulo |

## 2.2 Como fazer sem quebrar

**Em uma PR só, com três commits.** Banco, back-end e front-end são commits
separados para a revisão poder ir um a um, mas a mesma PR: o renome de coluna e
o código que a mapeia não se separam sem deixar a aplicação quebrada no meio, e
a verificação aqui é visual. A garantia de "funciona igual a antes" se cobra uma
vez, no fim da branch.

- **Z1 — banco.** Uma migração Flyway `V7__vocabulario_do_glossario.sql` com
  `ALTER TABLE ... RENAME TO` e `RENAME COLUMN`. Nada de recriar tabela: o
  renome preserva os dados, e o `ambiente.sh` já sabe orientar quem tiver o
  banco em versão anterior. No mesmo PR, o gerador
  `backend/tools/gerar_dados_de_teste.py` e o `db/seed/dados_de_teste.sql`
  regerado.
- **Z2 — back-end.** Renome das classes, colunas mapeadas, DTOs, rotas.
  `mvn test` verde. Os testes de integração existentes são a rede: se o mapeamento
  quebrar, eles acusam.
- **Z3 — front-end.** Renome dos schemas Zod, tipos, módulos de API e chamadas.
  `yarn build` verde (a checagem de tipos acontece dentro dele). A interface
  continua a feia de hoje, funcionando igual — este PR não muda uma linha de
  visual, de propósito: é o que torna a verificação simples.

Depois de Z3, confirmar na tela que as seis telas atuais continuam carregando e
salvando o que salvavam. Só então o trilho A começa.

---

# Parte 3 — Linguagem visual e navegação

## 3.1 O problema de hoje

- `globals.css` força `font-family: Arial` no `body`, anulando as três fontes
  que o `layout.tsx` carrega (`Inter`, `Geist`, `Geist_Mono`).
- `body` tem `bg-green-50` fixo, fora dos tokens.
- O modo escuro define **duas** variáveis no `@media (prefers-color-scheme)`
  (`--background`, `--foreground`) e as outras trinta e oito só na classe
  `.dark`, que nada aplica. Efeito: no escuro, o fundo muda e o resto não.
- Navegação é um `Header` de 21 linhas com dois links. Não há como chegar a uma
  partida ou a uma equipe sem passar pela competição.
- Ícones aparecem avulsos, sem um mapa conceito → ícone: o mesmo conceito ganha
  ícones diferentes em telas diferentes.
- Nenhuma tela tem estado de carregando, de erro ou de vazio.
- `components.json` está com `"rsc": false`, então todo componente novo do
  shadcn nasce cliente, mesmo os que não precisam.

## 3.2 Decisões de design

**Sistema.** Tokens em `oklch` no `globals.css`, primária verde mantida (é a
associação de campo do domínio), neutros com contraste real nos dois temas,
raios generosos (`--radius: 0.875rem`) e a escala derivada que já existe.
Superfícies em cartão com borda sutil e sombra baixa; nada de gradiente em
área de dado.

**Tema.** Claro e escuro completos, os dois definidos por token, com alternância
explícita persistida e respeito a `prefers-color-scheme` como padrão. O `.dark`
passa a ser aplicado de verdade.

**Tipografia.** Uma família (`Inter` variável) para texto e `Geist Mono` para
número tabular (placar, classificação). Remover `Arial` e o `Geist` sans
sobrando.

**Ícones.** Um arquivo `src/lib/icones.ts` mapeia **conceito do domínio →
ícone `lucide`** (`administracao: Building2`, `competicao: Trophy`,
`equipe: Shield`, `atleta: User`, `partida: Swords`, `sumula: ClipboardList`,
`fase: GitBranch`, `classificacao: ListOrdered`, `calendario: CalendarDays`,
`arbitro: Whistle`, `sancao: AlertTriangle`, `modalidade: Volleyball`…). Nenhuma
tela importa um ícone direto: importa do mapa. É o que garante que o mesmo
conceito tenha o mesmo ícone em todo lugar. Tamanho e traço fixos por token, e
um componente `IconeChip` (quadrado arredondado com fundo tingido) para o uso
em lista e cabeçalho.

**Layout.** Menu lateral fixo, recolhível (ícone só), com seções separando o que
é global do que é da competição selecionada. Conteúdo com cabeçalho de página
grudado no topo: título, trilha de navegação e as ações primárias à direita.
Responsivo: no celular o menu vira gaveta.

**Estados.** Quatro primitivas reusadas por todas as telas: `Carregando`
(esqueleto com a forma do conteúdo, não spinner), `Vazio` (ícone do conceito +
frase + ação), `Erro` (mensagem do contrato de erro + botão de tentar de novo) e
`Confirmacao` (diálogo obrigatório em toda ação destrutiva). Retorno de escrita
por toast.

## 3.3 O escopo global: administração e competição

Metade das telas só faz sentido com uma competição escolhida, e uma competição
mora dentro de uma administração. A solução:

**Um seletor no topo do menu lateral** mostrando o escopo atual em duas linhas —
nome da competição em cima, nome da administração embaixo, em corpo menor. Um
clique abre um **campo de busca** que filtra competições por nome, e cada
resultado repete o par nome / administração. Digitar e dar `Enter` troca o
escopo sem sair da página equivalente. `Ctrl/⌘ K` abre o mesmo campo de
qualquer lugar.

Quem não sabe o nome tem o caminho longo: o mesmo seletor oferece "escolher por
administração", que leva à página de administrações → página de competições da
administração → competição. O atalho é o caminho rápido; a navegação por página
continua existindo.

**Onde o escopo vive.** Na URL, não em estado global: as rotas da competição são
`/competicao/[id]/...`, e o seletor apenas navega. Isso mantém uma única fonte
de verdade, deixa qualquer tela compartilhável por link e sobrevive ao
recarregar. O último escopo usado fica no `localStorage` só para uma coisa: ao
abrir a raiz do app, voltar para onde a pessoa estava. Telas que exigem
competição e não têm id na rota redirecionam para o seletor em vez de quebrar.

## 3.4 Mapa de navegação

```
Menu lateral
├─ [seletor de escopo]  Competição ▾  / administração, com busca (⌘K)
│
├─ GLOBAL
│  ├─ Início                        /
│  ├─ Competições                   /competicao     (escolhe a administração
│  │                                                 e lista as competições
│  │                                                 dela, na mesma página)
│  ├─ Equipes                       /equipe
│  ├─ Árbitros                      /arbitro
│  └─ Cadastros                     /cadastro       (modalidade, federação)
│
├─ COMPETIÇÃO  (só com escopo escolhido)
│  ├─ Visão geral                   /competicao/[id]
│  ├─ Estrutura                     /competicao/[id]/estrutura     ← construtor
│  ├─ Equipes inscritas             /competicao/[id]/equipe
│  ├─ Fases                         /competicao/[id]/fase
│  ├─ Classificação                 /competicao/[id]/classificacao
│  ├─ Chaveamento                   /competicao/[id]/chaveamento
│  ├─ Calendário                    /competicao/[id]/partida
│  └─ Sanções                       /competicao/[id]/sancao
│
└─ [rodapé]  tema, e o lugar reservado do usuário (inerte nesta sprint)

Fora do menu (alcançadas por navegação)
├─ Equipe                           /equipe/[id]            (elenco, atletas)
├─ Partida                          /competicao/[id]/partida/[idPartida]
└─ Súmula                           /competicao/[id]/partida/[idPartida]/sumula
```

## 3.5 Camada de dados — o que se mantém

`src/lib/api/` fica. `client.ts` (`apiFetch`, `ApiError`) já faz o certo: base
por variável de ambiente, `no-store`, extração de mensagem de erro. Os módulos
existentes e os schemas Zod em `src/lib/types/` são reaproveitados e ampliados,
não reescritos. O que muda:

- `client.ts` passa a entender o contrato de erro novo (`codigo`, `detalhes` por
  campo) e a expor os erros de campo para o formulário.
- Módulos novos: `fases.ts`, `arbitros.ts`, `federacoes.ts`, `sancoes.ts`,
  `tabela.ts`, `atributosDeFase.ts`.
- Funções de escrita que faltam (remover administração, remover competição,
  inscrever e remover equipe, agendar partida, finalizar partida, escalar
  árbitro…).
- Tradução de enum `SCREAMING_SNAKE` → rótulo em pt-BR num único lugar
  (`src/lib/rotulos.ts`), não espalhada por componente.

O que é **apagado**: `app/` inteiro exceto `layout.tsx` (reescrito) e
`globals.css` (reescrito), `src/components/` (`Header`, `DuoGrid`,
`ToggledGrid`), e `src/features/` inteiro.

Os mocks **saíram do front** no trilho 0, para
`backend/tools/dados-de-origem/`. Eles são a fonte do gerador
`gerar_dados_de_teste.py`, que os lê por expressão regular procurando os
identificadores em inglês em que foram escritos (`Team`, `players`,
`homeTeam`). Mantê-los dentro do front obrigaria a conservar uma cópia dos
tipos em inglês só para eles — dois vocabulários no mesmo projeto, que é o que
o renome existe para acabar. Do lado de quem os lê, ficam com as formas
declaradas no próprio diretório e não são compilados por ninguém.

---

# Parte 4 — Pilha de PRs

Cada PR sai da branch do anterior e é revisado e mesclado em ordem. O
`pre-commit` roda `yarn build` (tipos) e `mvn test` no que mudou; todo PR que
toca `backend/` precisa do ambiente no ar.

## Trilho 0 — Vocabulário (bloqueia tudo)

Uma PR — `refactor/vocabulario-do-glossario` — com três commits:

| Commit | Conteúdo |
|---|---|
| Z1 | `V7__vocabulario_do_glossario.sql` com os renomes de tabela, coluna, sequência e índice. Gerador de dados de teste, `dados_de_teste.sql` regerado e o script de carga. |
| Z2 | Renome das classes, mapeamentos, DTOs e rotas. `PUT /recurso/{id}` uniforme. |
| Z3 | Renome dos schemas Zod, tipos e módulos de API do front, e saída dos mocks para `backend/tools/dados-de-origem/`. Zero mudança visual. |

O Z3 renomeia o que **sobrevive** ao redesign: `src/lib/types/` e
`src/lib/api/`. Os identificadores em inglês que ainda há dentro de `app/` e de
`src/features/` (`TeamDetail`, `CompetitionDetail`, `PlayerDialog`, `matchId`,
as pastas de rota `/campeonatos` e `/times/[teamId]`) ficam como estão: esses
arquivos são apagados em A2 e reescritos em C, e renomear identificador em
arquivo condenado é trabalho jogado fora. As rotas passam ao vocabulário novo em
A2/A3, junto com o mapa de navegação.

Verificação no fim da branch, não por commit: `mvn test` e `yarn build` verdes,
ambiente subindo do zero (`limpar` + `subir`) e as seis telas atuais carregando
e salvando o que salvavam.

## Trilho A — Fundação

| # | PR | Conteúdo | Depende |
|---|---|---|---|
| A1 | `feat/redesign-tokens` | `globals.css` reescrito: tokens dos dois temas completos, raios, tipografia. Remove `Arial` e o `bg-green-50`. `components.json` com `"rsc": true`. Alternância de tema persistida. Página de amostra dos tokens para revisão visual. | Z3 |
| A2 | `feat/redesign-shell` | `app/layout.tsx`, menu lateral recolhível, cabeçalho de página, trilha de navegação, gaveta no celular, `src/lib/icones.ts`, `IconeChip`, e as quatro primitivas (`Carregando`, `Vazio`, `Erro`, `Confirmacao`) + toast. Rotas ainda vazias. | A1 |
| A3 | `feat/seletor-de-escopo` | Seletor de competição/administração no menu, busca por nome com a administração em subtítulo, `⌘K`, retomada do último escopo, redirecionamento das rotas que exigem escopo. | A2 |

## Trilho B — API: destravar o que falta

Em paralelo ao trilho A por outra pessoa ou agente — não tocam os mesmos
arquivos. Todos saem de Z2.

| # | PR | Conteúdo |
|---|---|---|
| B1 | `feat/api-contrato-de-erro` | `@ControllerAdvice` + `{ erro: { codigo, mensagem, detalhes } }`, `MethodArgumentNotValidException` → `detalhes` por campo. CORS central. Nota em `padrao-api.md` sobre o envelope de sucesso pendente. |
| B2 | `feat/api-inscricao-de-equipe` | `POST` / `DELETE /competicao/{id}/equipe/{idEquipe}`. Corrige o typo `removerTimeDoCapeonato`. Teste de integração dos dois. |
| B3 | `feat/api-elenco-e-fases` | `GET /equipe/{id}/atleta`, `POST` / `DELETE /equipe/{id}/atleta/{idAtleta}`, filtro `?idCompeticao=` em `GET /fase`, filtros `?idModalidade=` e de formato. |
| B4 | `feat/api-federacao` | `FederacaoController` (CRUD) sobre o service existente. |
| B5 | `feat/api-partida-e-sumula` | `PartidaCreateRequest`, uso do `PartidaUpdateRequest`, `SumulaCreate/UpdateRequest`; migração de `Partida.dataHora` + `Partida.local`; `PartidaResponse` e `SumulaResponse` em todas as rotas (fecha o ciclo `Partida ↔ Sumula`). |
| B6 | `refactor/api-sancao` | Separa `SancaoController` em `/sancao` e `/sancao_atleta`; inativação passa a ser `PUT`. |
| B7 | `feat/api-estado-da-competicao` | `Competicao.estado` (`RASCUNHO`/`EM_ANDAMENTO`/`ENCERRADA`/`CANCELADA`), migração, transições validadas no service, `PUT /competicao/{id}/estado`. |

## Trilho C — Páginas (uma ou duas por PR)

| # | PR | Página | Depende |
|---|---|---|---|
| C1 | `feat/pagina-inicio` | Início: cartões de resumo do escopo, próximas partidas, atalhos | A3 |
| C2 | `feat/pagina-competicoes` | Competições: administrações à esquerda, competições da escolhida à direita — uma página só. Criar, editar e remover dos dois lados | A3, B1 |

**Administrações e competições ficaram na mesma página.** Eram duas entregas e
viraram uma: a lista de competições não existe sozinha — sem administração
escolhida não tem o que mostrar, e com uma escolhida repete o que a outra tela
já mostrava ao lado. Escolher à esquerda, ver à direita, um item de menu só.

Os próximos jogos saíram da lista e foram para dentro da competição: fora dela
não diziam de qual competição eram.
| C4 | `feat/pagina-competicao-visao-geral` | Competição: visão geral + edição (nome, descrição, categoria, modalidades) e estado | C3, B7 |
| C5 | `feat/pagina-competicao-equipes` | Equipes inscritas: inscrever (busca entre as existentes), remover, atalho para a equipe | C4, B2 |
| C6 | `feat/pagina-equipes` | Equipes (global): lista, criar, editar, remover; modalidade e federação | A3, B4 |
| C7 | `feat/pagina-equipe-elenco` | Equipe: detalhe e elenco — adicionar, editar e remover atleta | C6, B3 |
| C8 | `feat/pagina-competicao-fases` | Fases: lista ordenada, criar, editar, remover, encadear sucessora, validar e gerar confrontos | C4, B3 |
| C9 | `feat/pagina-classificacao` | Classificação por fase, consumindo `/fase/{id}/classificacao` | C8 |
| C10 | `feat/pagina-chaveamento` | Chaveamento da fase eliminatória | C8 |
| C11 | `feat/pagina-calendario` | Calendário: partidas com filtro por fase, rodada e equipe; agendar data, hora e local | C8, B5 |
| C12 | `feat/pagina-partida` | Partida: detalhe, placar, escalar árbitro, finalizar (com confirmação) | C11, B5 |
| C13 | `feat/pagina-sumula` | Súmula da partida, pensada para celular: placar, ocorrências, observações, assinatura | C12, B5 |
| C14 | `feat/pagina-arbitros` | Árbitros: lista, criar, editar, remover | A3, B1 |
| C15 | `feat/pagina-sancoes` | Sanções da competição e sanções por atleta | C4, B6 |
| C16 | `feat/pagina-cadastros` | Cadastros de apoio: modalidade (leitura) e federação (CRUD) | C6, B4 |

## Trilho E — Construtor de competição personalizada

**É o item pelo qual cobrar o fim da sprint.** A ideia: montar uma competição
misturando fases de tipos diferentes — grupos alimentando eliminatória, pontos
corridos alimentando semifinal, o que o regulamento pedir — usando o motor de
fases que os PRs anteriores do back-end já entregaram.

O motor já suporta isso por construção: a entrada e a saída de toda fase é uma
classificação, então encadear tipos diferentes não exige que nenhum tipo conheça
o outro. O que falta é o que está em §1.5 e uma tela.

| # | PR | Conteúdo | Depende |
|---|---|---|---|
| E1 | `feat/estrategia-pontos-corridos` | `EstrategiaDePontosCorridos`: atributos suportados (turno único ou turno-returno, pontos por vitória/empate/derrota, critérios de desempate ordenados), geração de confrontos por rodízio, classificação. Testes com empate múltiplo e número ímpar de equipes. | Z2 |
| E2 | `feat/api-atributos-de-fase` | `GET /fase/atributo?tipoFase=` (código, tipo de dado, obrigatório, valor padrão, descrição) e `PUT /fase/{id}/atributo/{codigo}`. | Z2 |
| E3 | `feat/construtor-estrutura` | Tela `/competicao/[id]/estrutura`: a sequência de fases como uma trilha, adicionar fase escolhendo o tipo, reordenar, remover, encadear. Só editável com a competição em `RASCUNHO`. | C8, B7, E2 |
| E4 | `feat/construtor-configuracao-de-fase` | Formulário de configuração **gerado a partir dos atributos** que o tipo declara — nada escrito à mão por tipo. Validação contra `obrigatorio` e `tipoDado`. | E3 |
| E5 | `feat/construtor-validacao-e-publicacao` | Painel de validação consumindo `GET /fase/{id}/validacao` e `OrquestradorDeFases.validar` fase a fase, com o que falta em linguagem clara; publicar a competição (`RASCUNHO` → `EM_ANDAMENTO`) gerando os confrontos da primeira fase. | E4, E1 |
| E6 | `feat/construtor-modelos` | Modelos prontos como ponto de partida (pontos corridos puro; grupos + eliminatória; grupos + semifinal + final), que criam a estrutura já configurada e permitem ajuste. | E5 |

## Trilho D — Fechamento

| # | PR | Conteúdo |
|---|---|---|
| D1 | `chore/limpeza-do-front-antigo` | Remove o que sobrou de `src/components/` e `src/features/` antigos, e os schemas sem uso. Confere que nada referencia os mocks fora do gerador. |
| D2 | `docs/redesign` | Atualiza `documentos/` com o mapa de navegação, o mapa de ícones e o que mudou no contrato. Captura de tela das telas principais nos dois temas. |
| D3 | `chore/verificacao-responsiva` | Passagem em celular, tablet e desktop; sem rolagem horizontal; contraste conferido (RNF04, RNF11). |

## Ordem de execução

```
Z1 → Z2 → Z3 ─┬→ A1 → A2 → A3 ─┬→ C1
              │                 ├→ C2 → C3 → C4 ─┬→ C5           (B2)
              │                 │                 ├→ C8 ─┬→ C9
              │                 │                 │      ├→ C10
              │                 │                 │      ├→ C11 → C12 → C13   (B5)
              │                 │                 │      └→ E3 → E4 → E5 → E6
              │                 │                 └→ C15          (B6)
              │                 ├→ C6 → C7 (B3) → C16             (B4)
              │                 └→ C14
              └→ B1 → B2, B3, B4, B5, B6, B7   (em paralelo ao trilho A)
                 E1, E2                        (em paralelo ao trilho A)
                                                       tudo → D1 → D2 → D3
```

**Paralelizável:** os trilhos B e E1/E2 inteiros em paralelo ao A. Depois de A3,
os ramos `C2→C3→C4`, `C6→C7` e `C14` são independentes entre si.

## Definição de pronto da sprint

1. As trinta e duas entregas acima mescladas.
2. `./deploy/ambiente.sh subir` mostrando o sistema inteiro navegável, nos dois
   temas, em celular e desktop.
3. Toda tela fechando o ciclo: criar, ler, editar e **remover**, com confirmação
   nas destrutivas e mensagem de erro com causa.
4. Uma competição montada do zero pelo construtor, misturando fases de tipos
   diferentes, com confrontos gerados e classificação calculada pelo servidor.

## Achados de domínio para a equipe decidir

Coisas que apareceram durante a implementação, não são defeito claro, e a
decisão é de domínio — não de código.

**`tamanhoDoGrupo` é pista, não tamanho.** `EstrategiaDeGrupos` usa o atributo
para derivar a quantidade de grupos (`ceil(equipes / tamanho)`) e depois valida
a divisão por essa quantidade. Com 4 equipes e `tamanhoDoGrupo = 3`, ela forma
**2 grupos de 2** — e passa na validação. Quem pediu grupos de 3 recebe grupos
de 2 sem aviso. As opções são recusar quando o tamanho pedido não fecha, exigir
`permiteGruposDesiguais` nesse caso, ou documentar que o atributo é uma
preferência. Enquanto não se decide, o comportamento está coberto por teste,
para não mudar sem alguém notar.

**A estratégia de pontos corridos delega para a de grupos com um grupo só.**
São a mesma disputa, e o comentário da própria `EstrategiaDeGrupos` já dizia
isso. O que não se delega é a lista de atributos: quem monta tabela única não
escolhe número nem tamanho de grupo.

## Fora desta sprint (registrado)

Autenticação e papéis (Fase 4 do backlog), entidade `Evento` e o motor de
cálculo derivado dela (Fases 2 e 3), escalação, estado da partida, súmula
offline com reenvio (Fase 6), painel público (Fase 7), envelope de resposta de
sucesso, paginação.
