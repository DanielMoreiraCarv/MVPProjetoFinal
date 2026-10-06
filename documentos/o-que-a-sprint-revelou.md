# O que a sprint do redesign revelou

Relatório de fechamento da reescrita do front-end. A parte mais útil deste
documento não é a lista de telas: é a lista de defeitos que a reescrita
descobriu, porque ela diz algo sobre como o projeto chegou até aqui.

## O que ficou pronto

**Vocabulário.** O esquema, o Java e o front falam o glossário: competição,
equipe, atleta. Sete tabelas, 24 colunas, quatro sequências e sete índices
renomeados; as rotas no singular; a convenção de chave estrangeira unificada em
`<entidade>_id`, que é a do MER.

**Base visual.** Tokens em `oklch` com tema claro e escuro completos, decididos
por classe e aplicados antes da primeira pintura. Uma família de texto e a mono
reservada para número em coluna. Mapa de conceito do domínio para ícone, com
dezessete conceitos e nenhum ícone repetido.

**Casca.** Menu lateral recolhível, gaveta no celular, cabeçalho de página com
trilha de navegação, e as quatro situações que toda tela atravessa — carregando
com esqueleto, vazio, erro com a causa do servidor, e confirmação em ação
destrutiva.

**Escopo.** Competição e administração sempre visíveis no topo do menu, com
busca por nome que ignora acento e abre por `⌘K`. O escopo mora na URL, então
qualquer tela é compartilhável por link.

**Quinze rotas de tela**, todas fechando o ciclo de criar, ler, editar e
remover: início, competições (com as administrações na mesma página), a
competição, estrutura, fases, classificação, calendário, partida, súmula,
sanções, equipes, elenco, árbitros, cadastros e a amostra da base visual.

**Construtor de competição personalizada.** Sequência de fases encadeadas
misturando formatos, com seis modelos de partida e o formulário de configuração
montado a partir do que cada estratégia do servidor declara — nenhum campo
escrito na tela.

**Back-end.** Contrato de erro em toda falha, CORS central, as rotas que
faltavam para inscrição de equipe, elenco, federação, partida e súmula com DTO
de verdade, agendamento com data e local, estado da competição com transições
validadas, e a estratégia de pontos corridos, que não existia.

**106 testes** no back-end, todos exigindo o Postgres local no ar.

## Os defeitos que a reescrita revelou

Vinte e três, nenhum deles achado lendo código. O padrão é sempre o mesmo: **o
método existia, compilava, e nada o chamava.**

### Coisas que respondiam sucesso sem fazer nada

| Onde | O que acontecia |
|---|---|
| `Competicao.removerEquipe` | `List.remove(objeto)` com `Equipe` sem `equals`: comparava por identidade, nunca achava, e respondia sucesso sem remover |
| `Competicao.adicionarEquipe` | recusava equipe de outra modalidade com `System.out.println` e retornava normalmente |
| `POST /equipe` | descartava `idModalidade`: a equipe nascia sem modalidade, e a inscrição na competição, que compara modalidade, passava a recusar sempre |
| `POST /fase` | aceitava `qtdClassificados` e não gravava |
| `POST /arbitro` | `arbitro.setFederacao(arbitro.getFederacao())` — lia do objeto recém-criado, então a federação escolhida era descartada |
| `EquipeService.atualizarEquipe` | chamava `federacaoService.buscarPorId` e descartava o resultado; renomear uma equipe apagava a federação e a modalidade dela |
| `PartidaController.escalarArbitro` | chamava `registrarTrabalho()` e nunca salvava o árbitro: o contador só subia por acaso |
| Diálogo de adicionar equipe | criava equipe falsa com `id: Date.now()` em estado local; nunca chegou ao servidor |

### Coisas que respondiam a coisa errada

| Onde | O que acontecia |
|---|---|
| `/partida/equipe/{idTime}` | o caminho declarava `idTime` e o método recebia `idEquipe`: 500 em qualquer chamada |
| `/acompanhamento/{status}` | os dois ramos do `if` chamavam `listarPendentes`: pedir as realizadas devolvia as que faltam jogar |
| `escalarArbitro` | lançava "Partida não encontrada", com o id da partida, quando quem faltava era o árbitro |
| `GET /arbitro` | respondia 200 com corpo vazio sem árbitros; o cliente estourava com "Unexpected end of JSON input". O mesmo em quatro mappers |
| Resposta de fase | devolvia a descrição ("Pontos Corridos") enquanto o pedido exige a constante (`PONTOS_CORRIDOS`) |
| `PUT /atleta/{id}` | zerava o que não recebia: corrigir a idade apagava o CPF e a modalidade |
| `POST /atleta` sem equipe | 500 em `findById(null)` |
| `listarModalidades()` no front | o schema pedia `jogadoresEmQuadra` e a V7 renomeou para `atletasEmQuadra`: o `parse` descartava a lista inteira, e todo seletor de modalidade abria vazio |
| Rótulo de fase no front | traduzia `ELIMINATORIA` para "Final", então toda partida de mata-mata aparecia como decisão |

### Coisas que não davam para fazer

| Onde | O que acontecia |
|---|---|
| Remover equipe de competição | os métodos existiam no serviço e nenhum controller os expunha |
| Elenco da equipe | idem, e o elenco estava modelado duas vezes — pela coluna e por uma associativa — que podiam discordar |
| Federação | entidade, repositório, mapper, DTOs e exceptions prontos, e nenhuma rota |
| Fases de uma competição | `GET /fase` devolvia as de todas as competições |
| `PONTOS_CORRIDOS` | `EnumFasePartida` declarava o tipo e `RegistroDeEstrategias` lançava exceção: o formato mais comum em competição amadora |
| Atributos de fase | o catálogo existia no repositório e não saía por HTTP |
| Desencadear fase | sucessora nula era lida como "não muda", então o vínculo podia ser trocado mas nunca removido |
| Apagar fase configurada | violava chave estrangeira com os valores de atributo |
| Dois `PUT` | declaravam `{id}` no caminho e liam o id do corpo |
| 41 respostas 404 | saíam sem corpo, e a tela só podia dizer "a requisição falhou" |

### Coisas que enganavam quem lia

`@ManyToMany(cascade = CascadeType.ALL)` nas equipes da competição: apagar uma
competição apagaria as equipes dela, que podem estar inscritas em outra.
`SumulaResponse.observacoes` era uma lista de um elemento. `PartidaResponse`
aninhava o elenco completo das duas equipes — treze partidas devolviam 50 KB
para uma tela que usa o nome. O placar saía como a string `"2 x 1"`, que o
cliente partia ao meio para recuperar dois inteiros. E dois erros de digitação
no esquema: `excao` e `observacoes_relatas`.

## O que isso diz

O código não estava mal escrito. Estava **não exercitado**. Métodos de serviço
sem rota, rotas sem cliente, campos sem leitura: cada um deles compilava, e
nenhum tinha como falhar, porque nada os executava.

Três verificações passaram a existir por causa disso, e as três pegaram defeito
real no mesmo dia em que foram escritas:

1. **`yarn cores`** — recusa cor fixa. Nasceu de `text-black` num contêiner, que
   deixava quatro títulos ilegíveis no tema escuro.
2. **`yarn contrato`** — roda os schemas do front contra a API no ar. Pegou o
   placar que parou de ser extraído e o schema de modalidade quebrado pelo
   renome, os dois com o build passando.
3. **O teste antes da rota** — escrever o teste antes de expor o método foi o
   que revelou que a remoção de equipe nunca funcionou. Rodei cada teste contra
   a implementação antiga para confirmar que ele falhava; sem isso, um teste que
   passa de primeira não prova nada.

## O que continua pendente, e por quê

**O que se deriva dos eventos.** A súmula passou a registrar evento por atleta
(ver "Súmula completa e simplificada", abaixo), mas a artilharia (RF114), a
contagem de cartão ao longo da competição (RF105) e a suspensão automática
(RF106) ainda não leem esses eventos. A tela de sanções continua lançando a
punição à mão.

**A conta local que sobrou.** As fases de pontos têm tabela no servidor
(`GET /fase/{id}/tabela`, abaixo). `src/features/campeonatos/calculos.ts`
continua só para as competições anteriores às fases, cujas partidas não
pertencem a fase nenhuma e por isso não têm de onde o servidor tirar a tabela.
Quando essas competições forem migradas para fases, o arquivo sai com um
`git rm`.

**O chaveamento.** A API informa o formato da fase por partida, não o estágio da
eliminatória. Não há como montar a chave no cliente, e a aba diz isso em vez de
desenhar uma chave inventada. O back-end tem o modelo certo (`vinculoSucessor`,
`origensPartida`) e não o expõe.

**Autenticação.** Zero linhas, como antes. Toda a sprint assume usuário único, e
o lugar do usuário na interface está reservado e vazio.

**O envelope de sucesso** (`{ "resultado": ... }`) da §2 de `padrao-api.md`, e a
paginação. Nenhuma tela consome a diferença; mexer nisso toca todas as rotas e
todos os parsers de uma vez.

**Rodada.** `PartidaResponse` não traz o número da rodada, então o calendário
não oferece o filtro por rodada.

## Achados de domínio para a equipe decidir

**`tamanhoDoGrupo` é pista, não tamanho.** A estratégia de grupos usa o atributo
para derivar a quantidade de grupos e depois valida a divisão por essa
quantidade. Com 4 equipes e `tamanhoDoGrupo = 3` ela forma **2 grupos de 2**, e
passa na validação. Quem pediu grupos de 3 recebe grupos de 2 sem aviso. Está
coberto por teste para não mudar sem alguém notar.

**Federação de árbitro é texto solto**, não chave estrangeira — diferente da
federação de equipe. Por isso a tela oferece a lista cadastrada em vez de campo
livre: texto livre viraria "CBF", "C.B.F." e "cbf" como três federações.

**Atleta não tem posição nem data de nascimento.** O modelo tem `idade`, que
envelhece, quando o RF36 pede data de nascimento. A tela não inventou os campos.

## Revisão da interface

Passagem pela interface no navegador, tela por tela, nos dois temas e no
celular. O que ela encontrou:

**Ciclo de cadastro que a tela não fechava.** As rotas existiam e nenhuma
tela as chamava: excluir e editar administração, excluir competição, encerrar
e cancelar competição (só publicar tinha botão), editar e excluir partida,
salvar a súmula sem assinar e excluir a súmula. Todas ganharam tela.

**Excluir respondia 409 sem dizer por quê.** Competição com partida e
administração com competição caíam na violação de chave estrangeira, e a
mensagem era o genérico "conflita com um vínculo em uso". Agora o serviço
recusa antes, com a contagem e o que fazer — no mesmo padrão da federação.

**A regra de sanção não podia ser criada.** O campo "Infração" era texto livre
e ia para `tipoEsporte`, que no servidor é enum: "Cartão vermelho" voltava como
`No enum constant`. E a resposta devolvia a descrição ("Futebol") enquanto o
pedido exige a constante (`FUTEBOL`) — o mesmo defeito que a fase já teve. O
campo virou uma escolha de esporte, a resposta devolve a constante, e o enum
recusa código inválido dizendo quais existem.

**O mesmo troféu quatro vezes no menu.** Logo, seletor de escopo,
"Competições" e "Visão geral" usavam o ícone da competição, e os dois últimos
ficavam ativos ao mesmo tempo. O ícone passou a ser só do conceito; instância
(o app, a competição escolhida, a equipe) usa monograma. Federação ganhou
ícone próprio — usava o da administração.

**Menu recolhido.** Os três botões de tema não cabiam nos 72 px e vazavam;
recolhido, vira um botão só que alterna em ciclo.

**Escolha entre muitos.** Botões lado a lado cortavam "Futebol de campo"; os
`<select>` nativos traziam o visual do sistema operacional. Os dois viraram
`Escolha`, sobre o `Select` do design system, que também foi alinhado aos
tokens do `Input`.

**Rolagem horizontal no celular** em competições e na visão geral: o
componente de seção estava copiado em dezesseis páginas, e numa das cópias
faltava `min-w-0`. Virou um componente só.

**Componentes que não tinham passado pelo redesign** — os diálogos de
administração e competição, o formulário de edição, a lista de equipes
inscritas, o calendário e a tabela de classificação da visão geral, com
identificadores em inglês e classes escritas à mão — foram reescritos no
padrão das outras telas.

**Criar fase era descobrir o que faltava depois.** O diálogo pedia nome,
ordem e formato; os campos do formato ficavam num painel separado, com o código
do servidor como rótulo (`numeroDeGrupos`), e a validação respondia "informe
exatamente um entre numeroDeGrupos e tamanhoDoGrupo". Agora o formato escolhido
traz os campos dele no mesmo diálogo — primeiro o que a fase precisa, depois as
regras já com o padrão —, os critérios de desempate viram uma lista ordenada, e
um resumo diz quantas equipes entram e como a fase vai ficar ("4 grupos de 4",
"8 → 4 → 2 → 1"). As mensagens de validação passaram a ser frases.

Quatro defeitos do motor de fases apareceram no caminho, cada um coberto por
teste escrito antes da correção:

| Onde | O que acontecia |
|---|---|
| `OrquestradorDeFases.entradaDe` | a quantidade de classificados era gravada e ignorada: a fase seguinte recebia a classificação inteira da anterior |
| `definirAtributo` | gravar vazio contava como informado, então trocar o número de grupos pelo tamanho deles caía sempre em "não os dois" |
| eliminatória como primeira fase | era sempre recusada: as inscritas entram empatadas e o orquestrador conferia o empate sem consultar a configuração, então "Aceitar empates na entrada" não tinha efeito. Os testes semeavam à mão e contornavam o orquestrador, por isso não viam |
| validação da fase seguinte | antes de a anterior ter classificação, dizia "precisa de ao menos 2 equipes, recebeu 0"; agora diz de qual fase as equipes vêm e o que fazer |

## Súmula completa e simplificada

A súmula guardava ocorrência como texto livre ("9' - Gol de João"). Agora tem
dois modos, trocáveis enquanto não for assinada:

- **Completa**, a padrão: o elenco das duas equipes lado a lado, com uma coluna
  por acontecimento — gol, gol contra, amarelo, vermelho indireto, vermelho
  direto, falta cometida e falta sofrida. Um toque na célula lança; no modo
  de correção, o toque tira o último. Sem minuto de jogo: num campeonato
  amador o que se anota é o acontecimento, e cada evento guarda a hora em que
  entrou na súmula.
- **Simplificada**: só o placar.

Nos dois modos o placar aceita o número direto, para o gol de que ninguém
sabe o autor; na completa, o gol lançado no atleta soma sozinho. O placar
nunca fica abaixo dos gols com autor. O segundo amarelo gera o vermelho
indireto (RF77), e tirar o amarelo tira o vermelho que ele gerou.

A folha sai em PDF no formato de papel — A4 deitado, os dois elencos, o
placar, observações e as linhas de assinatura —, sempre no tema claro. Sem
súmula, sai em branco, para anotar à mão (RF145).

Dois defeitos apareceram no caminho:

| Onde | O que acontecia |
|---|---|
| Assinar a súmula | não mudava nada na partida: os dois placares eram independentes, e a classificação não via o resultado da súmula. Agora assinar encerra a partida com o placar dela, e enquanto a súmula está aberta o placar da partida a acompanha |
| `DELETE /sumula/{id}` | respondia 204 e não apagava: a partida segura a súmula com cascata, e no flush a cascata a persistia de novo. O teste de tela da revisão anterior também não pegou, porque conferia a tela, e não o servidor |

## Tabela de pontos desde o início

A classificação de fase devolvia só a ordem — posição e equipe, sem pontos —,
e vazia até os confrontos serem gerados. As fases que se decidem por pontos,
grupos e pontos corridos, ganharam `GET /fase/{id}/tabela`: pontos, jogos,
vitórias, empates, derrotas, gols e saldo calculados no servidor (RNF23),
separados por grupo, e com quem entra na fase listado e zerado antes do
primeiro jogo. Na fase de grupos, enquanto os confrontos não são gerados, a
tabela é única e diz que os grupos saem na geração. A visão geral da
competição usa a tabela da primeira fase de pontos.

A rota `/classificacao`, que é o contrato de entrada entre as fases, ficou
como estava.

## Classificação fase a fase, e a chave

A visão geral e a página de classificação discordavam sobre a mesma
competição: a visão geral lia um campo antigo da competição ("pontos
corridos" ou "mata-mata", escolhido na criação) e mostrava tabela para uma
estrutura de mata-mata, enquanto a outra lia as fases. Agora as duas usam o
mesmo componente, fase a fase com uma escolha de fase, e o campo antigo saiu
do formulário da competição. Fase de pontos é tabela, um grupo por vez; a
eliminatória é chave — desenhada a partir das oitavas, e em lista de
confrontos, uma página por etapa, nas etapas maiores. A conta local que
sobrava (`calculos.ts`) saiu: competição sem fase diz que não tem fase.

A chave vem de `GET /fase/{id}/chaveamento`, já na ordem de desenho e com as
etapas futuras ("Vencedor do jogo 3"): o motor emparelha os vencedores do
primeiro contra o último, então a chave inteira é conhecida desde a primeira
rodada.

Três defeitos do motor apareceram no caminho, cada um com teste escrito antes:

| Onde | O que acontecia |
|---|---|
| Eliminatória | a rodada seguinte só era gerada chamando a rota de atualizar a fase, que nenhuma tela chamava: a chave parava na primeira rodada. Agora encerrar o último jogo da rodada — direto ou assinando a súmula — gera a seguinte |
| Entrada da fase seguinte | era a classificação provisória da anterior: com os grupos gerados e ninguém jogando, os primeiros de uma tabela zerada já entravam, e dava para gerar o mata-mata antes dos grupos. Agora só entra quem se classificou, quando todos os jogos da anterior terminam |
| `POST /fase` | aceitava `idFaseSucessora` e descartava, como já tinha acontecido com a quantidade de classificados |

## Quem avança da fase de grupos

A fase tinha um número só, "classificados", que valia para o total — e numa
fase de grupos quem monta pensa por grupo: os dois primeiros de cada um. O
atributo `classificadosPorGrupo` (padrão 2) entra na fase de grupos, e o total
passa a ser opcional: sem ele avançam grupos × por grupo. A classificação da
fase de grupos já vem ordenada por colocação — todos os primeiros, depois os
segundos, cada leva comparada pelos critérios de desempate —, então um total
menor leva os primeiros e os melhores segundos, e um maior, os melhores
terceiros. No diálogo, o campo é "Avançam por grupo", e o total sai calculado
embaixo ("16 equipes vão avançar: os 1º e 2º de cada grupo"); mudar o total é
a exceção, atrás de "Ajustar o total", com volta para o cálculo. É o mesmo
componente no diálogo de fase, no painel de configuração da página de fases e
na Estrutura — que tinha um campo "Classificados" próprio, de total, na frente
do "por grupo", e era por ali que se errava. Os modelos de grupos passaram a
dizer "2 por grupo" em vez de um total. Ele diz como
os grupos são comparados entre si, avisa quando o total não fecha uma chave,
e recusa mais classificados por grupo do que o grupo tem.

Apagar a fase seguinte de um encadeamento estourava a chave estrangeira — a
anterior seguia apontando para ela — e a tela só dizia "conflita com um
vínculo em uso". Agora a anterior é desencadeada antes, e a confirmação diz
isso. Quantas equipes entram e saem de
cada fase vem do servidor (`quantosEntram`, `quantosAvancam`), e a tela não
refaz a conta.

## Um botão só para gerar as partidas

Cada fase tinha o seu "Gerar confrontos", e a validação de uma fase seguinte
só acontecia depois de a anterior terminar — antes disso ela não tinha
entrada. Daí uma fase de grupos que classificava 24 para uma eliminatória
gerava as partidas normalmente, e o erro só aparecia quando os grupos
acabavam.

Agora a estrutura inteira é validada antes de qualquer partida
(`GET /competicao/{id}/estrutura`): cada fase seguinte é conferida contra a
entrada que vai ter — tantas equipes quantas a anterior faz avançar, em ordem
—, e uma fase que não recebe de nenhuma outra é apontada. As partidas saem por
um botão só (`POST /competicao/{id}/partidas`), na Estrutura e na visão
geral: se alguma fase não fechar, nada é gerado e a resposta diz qual e por
quê; se fechar, a primeira fase é gerada e a competição é publicada. As fases
seguintes nascem sozinhas quando a anterior termina. A classificação só
aparece depois de gerar — antes disso, uma tabela zerada parecia uma
competição em andamento que nem tinha sido montada. Na Estrutura, a seta entre
as fases acompanha o rascunho antes de gravar.

**Ainda pendente:** empate em eliminatória dá a vaga ao mandante, porque o
modelo não registra pênaltis. E a regra de sanção guarda o esporte, não a
infração. Para
"cartão vermelho = 1 jogo" o modelo precisa de um campo de infração, e a
contagem automática continua dependendo da entidade `Evento`.
