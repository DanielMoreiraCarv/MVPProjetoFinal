# Ambiente de Desenvolvimento

## Preparar o clone

```bash
git config core.hooksPath .githooks   # ativa o pre-commit (uma vez por clone)
cd frontend && yarn install           # o hook precisa de node_modules
```

O `core.hooksPath` **não** é versionado — cada pessoa roda o comando uma vez no
seu clone. Sem ele o hook simplesmente não dispara, sem aviso.

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
