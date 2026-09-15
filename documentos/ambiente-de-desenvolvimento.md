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
ela estiver parada, avisa qual container ou processo está segurando cada porta
antes de tentar subir, e derruba o pod anterior antes de recriar.

Rodar o front ou a API pela IDE ao mesmo tempo que o pod causa conflito de
porta — o script diz qual processo é e qual porta está ocupada.

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

### O que ele não cobre

- **Valida a árvore de trabalho, não o índice.** Se houver alteração não
  adicionada ao commit, ela participa da verificação. Em prática isso quase
  sempre coincide; quando não coincidir, o CI é a rede de segurança.
- **Não roda testes de verdade**, porque ainda não existem — nem no backend
  (`src/test/` ausente) nem no front. Hoje o hook garante que o projeto
  compila. Quando os testes chegarem (F1.13, Testcontainers + JUnit), passam a
  rodar automaticamente, sem mudar o hook.
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
