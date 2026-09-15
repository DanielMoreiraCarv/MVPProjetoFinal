# Ambiente de Desenvolvimento

## Preparar o clone

```bash
git config core.hooksPath .githooks   # ativa o pre-commit (uma vez por clone)
cd frontend && yarn install           # o hook precisa de node_modules
```

O `core.hooksPath` **não** é versionado — cada pessoa roda o comando uma vez no
seu clone. Sem ele o hook simplesmente não dispara, sem aviso.

## Subir o sistema

Um comando para tudo — banco, API e front:

```bash
./deploy/ambiente.sh subir
```

Constrói as duas imagens, sobe o pod, espera os serviços responderem e carrega
o conjunto de dados de teste. Ao final imprime os endereços:

| Serviço | Endereço |
|---|---|
| Front | http://localhost:3000 |
| API | http://localhost:8080/api/v1/modalidade |
| Banco | `localhost:5433`, usuário e senha `tcc` |

Com as imagens já construídas, o ciclo inteiro leva cerca de 10 segundos.

| Comando | O que faz |
|---|---|
| `subir` | constrói, sobe e carrega os dados |
| `subir --sem-build` | reaproveita as imagens (o caso do dia a dia) |
| `subir --sem-dados` | sobe sem carregar o conjunto de teste |
| `derrubar` | para o pod, mantendo os dados do banco |
| `reiniciar` | derruba e sobe de novo |
| `status` | mostra o que está no ar |
| `logs [api\|front\|postgres]` | acompanha os logs |
| `dados` | recarrega o conjunto de teste |
| `limpar` | derruba e **apaga** o volume do banco |

O script cuida sozinho de três tropeços comuns: inicia a máquina do podman se
ela estiver parada, derruba o pod anterior antes de recriar, e avisa qual
container ou processo está segurando cada porta antes de tentar subir.

Rodar o front ou a API pela IDE ao mesmo tempo que o pod causa conflito de
porta — o script diz qual processo é e qual porta está ocupada.

### Sistema operacional

O script não tenta adivinhar o sistema. Quando algo falha, ele mostra o erro do
próprio podman e para:

- **podman fora do PATH** → aponta https://podman.io/docs/installation
- **podman não responde** → tenta `podman machine start` uma vez, o que resolve
  o caso de macOS e Windows em que a máquina virtual caiu, e é inofensivo onde
  ela não existe. Se ainda assim não responder, imprime a saída literal de
  `podman info` e sai.
- **o pod não sobe** → repassa o erro do `podman play kube`, que já diz qual
  porta está em uso.

A identificação de qual processo ocupa uma porta depende de `lsof`. Onde ele
não existir, essa checagem apenas não encontra nada e quem reclama é o podman,
ao subir — com a porta no texto do erro.

### Limites de recursos

Os manifestos declaram `requests` e `limits` de CPU e memória por container:

| Container | requests | limits |
|---|---|---|
| postgres | 100m / 256Mi | 1 CPU / 1Gi |
| api | 250m / 512Mi | 2 CPUs / 1Gi |
| front | 100m / 256Mi | 1 CPU / 512Mi |

Além de serem boa prática de manifesto, os limites importam para a JVM: ela lê
o limite do container e dimensiona o heap a partir dele. Com 1Gi, o heap máximo
fica em 256Mi — sem o limite, a JVM se dimensionaria pela memória da máquina
inteira, que é bem diferente entre as máquinas da equipe.

Na prática, com os dados de teste carregados, o consumo fica em torno de 250Mi
na API, 35Mi no banco e 35Mi no front.

### Trocar de branch entre stacks

As stacks têm conjuntos diferentes de migração. Ao voltar de uma para outra, o
banco fica com versões que a branch atual não conhece, e o Flyway recusa
aplicar uma versão menor do que a maior já aplicada:

```
Detected resolved migration not applied to database: 3
```

O `subir` reconhece esse caso e mostra os dois conjuntos lado a lado. A saída é
sempre a mesma:

```bash
./deploy/ambiente.sh limpar && ./deploy/ambiente.sh subir
```

O volume do Postgres sobrevive ao `derrubar`, de propósito — é o `limpar` que o
apaga. Ele derruba os dois manifestos antes de remover, porque ambos
compartilham o volume e um container parado de qualquer um deles impede a
remoção.

## Rodar pela IDE

Para depurar com breakpoint, suba só o banco e rode a aplicação fora do
container:

```bash
podman play kube deploy/postgres-local.yaml
./deploy/carregar-dados-de-teste.sh
cd backend && mvn spring-boot:run     # em um terminal
cd frontend && yarn dev               # em outro
```

Os dois manifestos publicam a porta 5433, então rode **um de cada vez**.

## O pre-commit

`.githooks/pre-commit` impede commit que não compila. Roda só o lado que mudou:

| Alteração em | O que roda | Tempo |
|---|---|---|
| `backend/` | `mvn test` (compila e roda os testes) | ~2 s |
| `frontend/` | `yarn build` (inclui a checagem de tipos) | ~9 s |
| ambos | os dois | ~11 s |
| só `documentos/`, `deploy/` | nada | instantâneo |

O front não tem script de `typecheck` isolado; a checagem acontece dentro do
`next build`, que é por isso o comando escolhido.

Para pular num commit específico: `git commit --no-verify`.

### Os testes exigem o ambiente no ar

Os testes de integração falam com o Postgres local. Sem ele, eles **falham** —
de propósito, porque teste que se ignora sozinho passa despercebido justamente
quando deveria acusar algo. A mensagem diz o que fazer:

```
Postgres local indisponível em localhost:5433. Suba o ambiente antes de rodar os testes:
  ./deploy/ambiente.sh subir
```

Como o pre-commit roda `mvn test`, isso significa que **commit em backend/ com
o ambiente derrubado é bloqueado**. Suba o ambiente, ou use `--no-verify` se
souber que a alteração não precisa de verificação.

Remover essa dependência é a tarefa F1.13, com Testcontainers, que sobe um
Postgres próprio para os testes.

### O que ele não cobre

- **Valida a árvore de trabalho, não o índice.** Se houver alteração não
  adicionada ao commit, ela participa da verificação. Em prática isso quase
  sempre coincide; quando não coincidir, o CI é a rede de segurança.
- **No front ainda não há testes**, então lá o hook garante apenas que o
  projeto compila e os tipos batem.
- **Não substitui CI.** Quem usar `--no-verify`, ou não tiver rodado o
  `core.hooksPath`, passa direto. A verificação no servidor continua
  necessária — foi a ausência dela que deixou a `main` sem compilar por nove
  dias.

---

## Dados de teste

O conjunto que as telas usavam como mock vive agora em SQL:

```bash
podman play kube deploy/postgres-local.yaml
./deploy/carregar-dados-de-teste.sh
```

Aplica as migrações e carrega 2 administrações, 6 competições, 96 times,
1440 atletas e 78 partidas — os mesmos registros, com os mesmos nomes, que
estavam em `frontend/src/features/administracoes/mocks/`.

O script **apaga os dados existentes** antes de carregar. É idempotente: rode
quantas vezes quiser para voltar ao estado conhecido.

Os arquivos em `frontend/src/features/administracoes/mocks/` **não alimentam
mais as telas** — elas leem da API. Eles continuam no repositório por serem a
fonte do gerador descrito abaixo.

### De onde o SQL vem

`backend/src/main/resources/db/seed/dados_de_teste.sql` é **gerado**, não
escrito à mão:

```bash
python3 backend/tools/gerar_dados_de_teste.py
```

O gerador lê os arquivos de mock e emite o SQL. Se os mocks mudarem, regere em
vez de editar o `.sql`.

### Por que não é uma migração

`db/migration/` é esquema e roda em produção. `db/seed/` é dado de teste e só é
carregado por quem roda o script à mão. Um time chamado "Panteras Negras" não
pode aparecer no Supabase por acidente.

### O que não veio dos mocks

- **13 das 91 partidas.** São confrontos de fase futura cujos times ainda
  dependem do vencedor de outra partida — nos mocks vinham como
  `"Vencedor Partida 11"`. Entram quando a propagação do vencedor existir
  (RF98).
- **Data e local das partidas.** A tabela `partida` não tem essas colunas
  (E13, RF58 continua aberto), então o horário dos mocks se perde.
- **Súmulas e ocorrências.** Dependem de `Evento` como entidade (F2.1); hoje
  ocorrência é texto livre e não sustenta cálculo.
