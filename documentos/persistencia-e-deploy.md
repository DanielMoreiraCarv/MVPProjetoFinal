# Persistência e Deploy

## 1. Onde os dados moram

| Ambiente | Banco | Como o esquema chega lá |
|---|---|---|
| Desenvolvimento | Postgres 16 em container local (podman) | Flyway, no start da aplicação |
| Produção | Postgres gerenciado do **Supabase** | Flyway, no start da API no Render |

O H2 em memória foi removido. Todo dado se perdia no restart e o dialeto
divergia do Postgres, o que escondia problemas até o deploy.

O esquema pertence ao **Flyway**: as migrações versionadas em
`src/main/resources/db/migration` são a única fonte de verdade.

Em produção a API roda numa instância só, sempre ligada (Render), e aplica as
migrações ao subir (`FLYWAY_MIGRAR_NO_BOOT=true`). Em seguida o Hibernate
confere, com `ddl-auto=validate`: se o esquema não bater, a aplicação **recusa
subir** e o Render mantém a versão anterior no ar.

Migrar no boot só é seguro porque há uma instância. Se a API voltar a escalar
para várias, as migrações devem sair do boot e ir para um passo de deploy
antes da publicação.

## 2. Configuração

Nenhuma credencial no repositório. A aplicação lê três variáveis:

| Variável | Default | Produção |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/tcc` (pod local) | session pooler: `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `DB_USER` | `tcc` | `postgres.hiieswbpwrlggryqhtjv` |
| `DB_PASSWORD` | `tcc` | senha do Supabase — só no ambiente |
| `DB_POOL_SIZE` | `5` | `5` |
| `JPA_SHOW_SQL` | `false` | `false` |
| `FLYWAY_MIGRAR_NO_BOOT` | `false` | `true` — a API migra ao subir (§4.2) |
| `JWT_SEGREDO` | vazio: segredo aleatório a cada boot | **obrigatório**, ≥ 32 bytes; o Blueprint do Render gera um |
| `JWT_VALIDADE_MINUTOS` | `15` | validade do token de acesso |
| `JWT_RENOVACAO_DIAS` | `7` | validade do token de renovação |
| `AUTH_TENTATIVAS_ATE_BLOQUEAR` / `AUTH_BLOQUEIO_MINUTOS` | `5` / `15` | bloqueio de login por senha errada |
| `AUTH_CADASTRO_ABERTO` | `true` | `true` — quem se cadastra vira `ORGANIZADOR` das próprias competições |
| `AUTH_EXIGIR_LOGIN` | `true` | `true` — sem login só `/api/v1/publico/**` e as rotas de entrar; `false` abre a API inteira, só para diagnóstico |
| `ADMIN_EMAIL` / `ADMIN_SENHA` / `ADMIN_NOME` | vazio | cria o primeiro ADMINISTRADOR no boot, se o e-mail não existir |

Também: `CORS_ORIGENS` (padrão `http://localhost:3000`; em produção, o domínio
do Vercel — só importa para chamadas diretas do navegador).

Os defaults apontam para o pod local: rodar a API ou os testes sem configurar
nada nunca toca o banco de produção. `prepareThreshold=0` é obrigatório no
transaction pooler, que não mantém prepared statements entre comandos.

Para apontar a máquina local para o Supabase sem exportar a senha no shell, use
`backend/src/main/resources/application-local.properties` (linhas `DB_URL=...`,
`DB_USER=...`, `DB_PASSWORD=...`), ignorado pelo Git e pela imagem Docker.
Variável de ambiente prevalece sobre o arquivo. Os testes têm o próprio
`application.properties` e continuam no pod local — mas uma `DB_URL` exportada
no shell vale para eles também: não rode `mvn test` com o Supabase exportado.

A porta 5433 no host evita colisão com um Postgres já instalado na máquina.

## 3. Rodando localmente

Um comando sobe banco, API e front com o conjunto de dados de teste:

```bash
./deploy/ambiente.sh subir
```

Detalhes, subcomandos e como rodar pela IDE estão em
[`ambiente-de-desenvolvimento.md`](ambiente-de-desenvolvimento.md).

## 4. Deploy

| Parte | Onde | Como publica |
|---|---|---|
| Front (Next.js) | **Vercel**, *Root Directory* = `frontend` | a cada push na `main` |
| API (Spring Boot) | **Render**, container de `backend/Dockerfile` (`render.yaml`) | a cada push na `main` |
| Banco | **Supabase** | migrações aplicadas pela API ao subir |

### 4.1 Por que a API não fica no Vercel

O Vercel não tem runtime Java, e o Spring Boot é um servidor que precisa
ficar ligado. A tentativa anterior (`vercel.json` com `services` e imagens de
container) dependia de um recurso liberado por conta e, pior, roteava `/api/*`
direto para o backend: isso pulava `frontend/app/api/v1/[...caminho]/route.ts`,
que tira o token do cookie e o põe no `Authorization`, e toda chamada logada
voltava 401. Foi removida.

### 4.2 API no Render

`render.yaml` na raiz é um Blueprint: no Render, *New > Blueprint* e escolha o
repositório. Ele pede `DB_URL`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGENS`,
`ADMIN_EMAIL` e `ADMIN_SENHA`, e gera `JWT_SEGREDO` sozinho.

- `DB_URL` usa o **session pooler** (porta 5432), não o de transação: há uma
  instância só, sempre ligada, e com `FLYWAY_MIGRAR_NO_BOOT=true` ela aplica as
  migrações ao subir. Sem disputa entre instâncias, e se uma migração falhar a
  versão nova não entra no ar (o Render mantém a anterior até o health check
  passar).
- Health check: `/api/v1/publico/competicao`, rota pública.
- `PORT` é injetada pelo Render; `server.port=${PORT:8080}` já a lê.
- O plano gratuito desliga a instância após 15 minutos sem tráfego; o acesso
  seguinte espera a subida (cerca de 1 minuto). Aqueça a API antes da banca.

### 4.3 Front no Vercel

Projeto com *Root Directory* `frontend` e preset Next.js. Uma variável só:
`API_URL=https://<servico>.onrender.com/api/v1`. O navegador não fala com a
API (ver "Front-end e sessão"), então não há CORS entre front e back:
`CORS_ORIGENS` só importa se algum cliente do navegador chamar a API direto.

---

## 5. Conexões e migrações

### Qual conexão do Supabase usar

O Supabase expõe o mesmo banco por três endereços, e a escolha não é indiferente:

| Endereço | Porta | IP | Sessão | Uso aqui |
|---|---|---|---|---|
| Conexão direta `db.<ref>.supabase.co` | 5432 | **IPv6 apenas** | completa | não usamos |
| Session pooler `aws-<regiao>.pooler.supabase.com` | 5432 | IPv4 | completa | **API no Render e migrações** |
| Transaction pooler `aws-<regiao>.pooler.supabase.com` | 6543 | IPv4 | limitada | não usamos (feito para serverless) |

O *transaction pooler* serve para serverless, com muitas instâncias efêmeras.
Não é o caso aqui.

O Flyway **não** pode usar o transaction pooler. Ele toma um advisory lock do
Postgres, que vive na sessão, e no modo de transação a conexão volta para o
bolo a cada comando — o cadeado se perde. O *session pooler* mantém a sessão e
ainda é IPv4, então serve às migrações sem depender de IPv6.

### Primeira carga do banco

Dois caminhos levam ao mesmo esquema — comparados por `pg_dump --schema-only`:

- **banco vazio**: a API aplica V1 até a última migração ao subir;
- **`deploy/supabase/esquema_completo.sql`** no SQL Editor: cria V1–V6 e marca o
  baseline na 6; a API aplica da V7 em diante.

Toda tabela tem row level security (V15, e o callback `afterMigrate.sql` para o
histórico do Flyway). No Supabase, tabela sem RLS fica aberta pela API REST
automática dele, por fora da nossa API — inclusive `usuario`, com os hashes de
senha. O backend conecta como dono das tabelas e não passa pelo RLS.
`RlsEmTodasAsTabelasTest` falha se uma migração criar tabela sem ele.

### Segredos

Senha do banco e `JWT_SEGREDO` ficam só nas variáveis do Render; `API_URL` nas
do Vercel. Nenhum valor vai para o repositório.

### Regras das migrações

- Toda mudança de modelo exige uma migração nova (`V2__...`, `V3__...`).
- Migração já aplicada **nunca** é editada: o Flyway guarda o checksum e
  recusa a diferença.
- A migração precisa ser compatível com a versão anterior da aplicação, que
  ainda está no ar quando ela roda. Renomear ou remover coluna se faz em dois
  deploys: primeiro adiciona, depois remove.

---

## 6. Organização do repositório

```
backend/    API Spring Boot (pom.xml, src/, Dockerfile)
frontend/   Next.js (package.json, app/, Dockerfile para o ambiente local)
deploy/     manifestos de Pod para podman play kube
documentos/ glossário, padrão de API, MER/DER, este documento
render.yaml Blueprint da API no Render
```

O front veio de `filipe-ts/tcc-frontend` por `git subtree`, então os commits
originais estão preservados no histórico. O repositório antigo foi arquivado.

Comandos passam a precisar do diretório: `mvn -f backend/pom.xml ...` ou
`cd backend`, e `cd frontend` para `yarn`.

## Front-end e sessão

O navegador não fala com a API: chama `/api/v1` do próprio site, e o servidor
do Next repassa à API com o token. A sessão fica em três cookies `httpOnly`
(`tcc.acesso`, `tcc.renovacao`, `tcc.usuario`) — nenhum token passa pelo
JavaScript da página nem vai para o `localStorage`. O `proxy.ts` renova o
acesso vencido antes da página ou da chamada rodar, uma renovação só por token
mesmo com várias chamadas simultâneas.

| Variável (front) | Padrão | Produção |
|---|---|---|
| `API_URL` | `NEXT_PUBLIC_API_URL`, ou `http://localhost:8080/api/v1` | endereço da API **visto pelo servidor do Next** |

Quem entra na gestão: `ADMINISTRADOR`, `ORGANIZADOR`, `MESARIO` e `ARBITRO`
(os dois últimos só leem e preenchem a súmula). `PUBLICO` só acompanha.

## Contas e compartilhamento

Cada conta vê só o que é dela ou foi compartilhado com ela. A competição é a
unidade de compartilhamento: quem participa pode tudo nela, sem níveis entre
participantes, e pode convidar outras pessoas pelo e-mail. Convite para quem
ainda não tem conta fica guardado e vira participação no cadastro com aquele
e-mail — não há envio de e-mail.

Administração, equipe, atleta, árbitro e federação têm dono (quem criou) e são
vistos também por quem participa de uma competição em que aparecem. O
`ADMINISTRADOR` da plataforma vê tudo.

A conferência é central, em `Seguranca/`: `PortaDosRecursos` (ids do caminho e
da query), `IdsNoCorpo` (ids do corpo), `FiltroDeListas` (listas devolvidas),
todos pela tabela de `MapaDaPorta`. Um id sem regra derruba o pedido — falha
fechada —, e `IsolamentoEntreContasTest` varre todas as rotas registradas como
uma segunda conta.

No ambiente local, `dados_de_teste.sql` cria `organizador@` (dono de tudo),
`admin@`, `torcedor@` e `parceiro@meutorneio.app` (sem nada, para testar o
compartilhamento), todos com a senha `torneio123`.

