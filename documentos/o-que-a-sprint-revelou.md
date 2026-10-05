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

**A entidade `Evento`.** É o requisito central do trabalho e não existe. A
súmula guarda ocorrência como texto livre, então não há como derivar artilharia
(RF114), contagem de cartão (RF105) nem suspensão automática (RF106). A tela de
sanções lança a punição à mão e diz na própria tela por quê.

**A classificação vem do servidor só como ordem.** `GET /fase/{id}/classificacao`
devolve posição, id e nome da equipe — sem pontos, jogos, vitórias ou saldo. Por
isso `src/features/campeonatos/calculos.ts` continua calculando no cliente, o
que viola o RNF23. Está num arquivo só, com os limites escritos no topo, para a
remoção ser um `git rm` quando a rota devolver os números.

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

**Ainda pendente:** a regra de sanção guarda o esporte, não a infração. Para
"cartão vermelho = 1 jogo" o modelo precisa de um campo de infração, e a
contagem automática continua dependendo da entidade `Evento`.
