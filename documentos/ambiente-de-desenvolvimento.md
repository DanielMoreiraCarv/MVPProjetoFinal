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
