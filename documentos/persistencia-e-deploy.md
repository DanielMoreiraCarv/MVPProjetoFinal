# Persistência e Deploy

## 1. Onde os dados moram

| Ambiente | Banco | Como o esquema chega lá |
|---|---|---|
| Desenvolvimento | Postgres 16 em container local (podman) | Flyway, no start da aplicação |
| Produção | Postgres gerenciado do **Supabase** | Flyway, no start da aplicação |

O H2 em memória foi removido. Todo dado se perdia no restart e o dialeto
divergia do Postgres, o que escondia problemas até o deploy.

O esquema pertence ao **Flyway**: as migrações versionadas em
`src/main/resources/db/migration` são a única fonte de verdade.

As migrações são aplicadas **pelo pipeline de deploy**, antes da nova versão
receber tráfego — não no boot da aplicação. No arranque o Hibernate apenas
confere, com `ddl-auto=validate`: se faltar migração, a aplicação **recusa
subir** em vez de servir requisição contra um esquema errado.

Migrar no boot traria dois problemas em serverless: várias instâncias subindo
em paralelo disputariam a mesma migração, e um erro de migração só apareceria
com o tráfego já batendo.

## 2. Configuração

Nenhuma credencial no repositório. A aplicação lê três variáveis:

| Variável | Default (desenvolvimento) | Produção |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/tcc` | connection string do Supabase |
| `DB_USER` | `tcc` | usuário do Supabase |
| `DB_PASSWORD` | `tcc` | senha do Supabase |
| `DB_POOL_SIZE` | `5` | `5` |
| `JPA_SHOW_SQL` | `false` | `false` |
| `FLYWAY_MIGRAR_NO_BOOT` | `false` | `false` — quem migra é o pipeline |

O pipeline de deploy usa uma conexão à parte, em `DB_MIGRACAO_URL`. Ver §5.

Os defaults existem só para que `mvn spring-boot:run` funcione contra o pod
local. Em produção as três são obrigatórias e vêm do ambiente do PaaS.

A porta 5433 no host evita colisão com um Postgres já instalado na máquina.

## 3. Rodando localmente

**Só o banco** (API pela IDE, front por `yarn dev`):

```bash
podman play kube deploy/postgres-local.yaml
cd backend
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5433/tcc -Dflyway.user=tcc -Dflyway.password=tcc
mvn spring-boot:run
```

Rode `flyway:migrate` de novo sempre que aparecer uma migração nova. Se
esquecer, a aplicação recusa subir dizendo qual tabela falta.

**Sistema completo** — banco, API e front em container:

```bash
podman build -t tcc-api:dev   -f backend/Dockerfile.vercel  backend
podman build -t tcc-front:dev -f frontend/Dockerfile.vercel frontend
podman play kube deploy/desenvolvimento.yaml
```

| Serviço | Endereço |
|---|---|
| Front | http://localhost:3000 |
| API | http://localhost:8080/api/v1/modalidade |
| Banco | `localhost:5433`, usuário e senha `tcc` |

Derrubar:

```bash
podman play kube --down deploy/desenvolvimento.yaml
```

Os manifestos são Pod do Kubernetes, lidos pelo `podman play kube`. Os dois
containers do `desenvolvimento.yaml` compartilham a rede do pod, por isso a API
alcança o banco em `localhost:5432`.

Os dois manifestos publicam a porta 5433 no host: rode **um de cada vez**, ou o
segundo fica preso em `Created` por conflito de porta.

No `desenvolvimento.yaml` a API sobe com `FLYWAY_MIGRAR_NO_BOOT=true`, para não
exigir o comando de migração à mão. É conveniência local; em produção o valor
é `false`.

O volume do Postgres **sobrevive** ao `--down`. Se uma migração ainda não
mergeada for editada depois de aplicada, o Flyway recusa subir com
*checksum mismatch*. Para zerar o ambiente local:

```bash
podman play kube --down deploy/desenvolvimento.yaml
podman volume rm tcc-postgres
```

## 4. Deploy

A aplicação é distribuída como imagem de container (build em dois estágios:
Maven para compilar, JRE para rodar). Há dois destinos possíveis.

### 4.1 Vercel (container image)

O Vercel Functions executa imagens OCI. Um `Dockerfile.vercel` na raiz é
detectado automaticamente e todo o tráfego é roteado para o container, que
precisa abrir um servidor HTTP na porta indicada por `PORT`. É o que
`Dockerfile.vercel` e `server.port=${PORT:8080}` fazem.

O limite de 250 MB é de bundle de código e não se aplica a imagem: o registro
do Vercel aceita até 15 GB por imagem, então a base JRE cabe sem esforço.

Não existe runtime Java no Vercel — nem oficial nem comunitário. Qualquer
`vercel.json` com `@vercel/java` falha; esse pacote não existe. O caminho é a
imagem de container.

Configurar no projeto do Vercel: `DB_URL` (transaction pooler), `DB_USER`,
`DB_PASSWORD` e `DB_POOL_SIZE`. Memória e duração máxima ficam nas
configurações do projeto. As migrações não passam por aqui — ver §5.

O que muda em relação a um servidor sempre ligado:

- **Escala a zero.** Sem tráfego por 5 minutos em produção (30 segundos em
  preview), a instância é desligada. A requisição seguinte paga a subida da
  JVM — medida em 3,2 s no container. Para uma apresentação de banca, vale
  aquecer a API antes.
- **Encerramento.** O container recebe `SIGTERM` com 30 s de carência, por
  isso `server.shutdown=graceful`.
- **Conexões.** Várias instâncias sobem em paralelo. O pool do Hikari fica
  pequeno por instância (`DB_POOL_SIZE`, default 5) e a aplicação deve usar o
  *pooler de transação* do Supabase (porta 6543), não a conexão direta.
- **Corpo da requisição.** Teto de 4,5 MB por requisição e por resposta.
  Suficiente para este domínio, mas limita upload de foto de atleta.
- **Sem IP fixo.** Static IP e Secure Compute ainda não valem para imagem de
  container. Irrelevante aqui, já que o Supabase é acessado por TLS público.

Verificar antes de decidir: o recurso de imagem de container exige permissão
habilitada na conta, o que precisa ser confirmado no plano de vocês.

### 4.2 PaaS de container (Railway, Render, Fly.io)

Mesma imagem, sem escala a zero e sem os tetos acima. É a opção conservadora
caso a permissão de imagem de container não esteja disponível, ou caso a
latência do primeiro acesso incomode na banca.

### 4.3 Front e back no mesmo projeto

Com o monorepo, o `vercel.json` na raiz declara os dois serviços e roteia por
caminho: `/api/*` vai para o backend, o resto para o front. Os dois passam a
compartilhar origem, o que **elimina o CORS** entre eles — o
`@CrossOrigin("*")` dos controllers deixa de ser necessário e pode sair junto
com a tarefa de configuração central de CORS.

---

## 5. O pipeline de deploy

`.github/workflows/deploy.yml` roda a cada push na `main`, em ordem:

1. `mvn flyway:migrate` contra o Supabase
2. `vercel deploy --prod`

**Para a ordem valer, o deploy automático do Git precisa estar desligado nas
configurações do projeto no Vercel.** Se ficar ligado, o Vercel publica em
paralelo com o job e a nova versão pode chegar antes da migração.

### Qual conexão do Supabase usar

O Supabase expõe o mesmo banco por três endereços, e a escolha não é indiferente:

| Endereço | Porta | IP | Sessão | Uso aqui |
|---|---|---|---|---|
| Conexão direta `db.<ref>.supabase.co` | 5432 | **IPv6 apenas** | completa | não usamos |
| Session pooler `aws-<regiao>.pooler.supabase.com` | 5432 | IPv4 | completa | **migrações** |
| Transaction pooler `aws-<regiao>.pooler.supabase.com` | 6543 | IPv4 | limitada | **aplicação** |

A aplicação usa o *transaction pooler*: em serverless sobem muitas instâncias
efêmeras, e é para isso que ele existe.

O Flyway **não** pode usar o transaction pooler. Ele toma um advisory lock do
Postgres, que vive na sessão, e no modo de transação a conexão volta para o
bolo a cada comando — o cadeado se perde. O *session pooler* mantém a sessão e
ainda é IPv4, então serve às migrações sem depender de IPv6.

### Segredos do repositório

`DB_MIGRACAO_URL` (session pooler), `DB_USER`, `DB_PASSWORD`, `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Nenhum valor vai para o repositório.

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
backend/    API Spring Boot (pom.xml, src/, Dockerfile.vercel)
frontend/   Next.js (package.json, app/, Dockerfile.vercel)
deploy/     manifestos de Pod para podman play kube
documentos/ glossário, padrão de API, MER/DER, este documento
vercel.json roteamento entre os dois serviços
```

O front veio de `filipe-ts/tcc-frontend` por `git subtree`, então os commits
originais estão preservados no histórico. O repositório antigo foi arquivado.

Comandos passam a precisar do diretório: `mvn -f backend/pom.xml ...` ou
`cd backend`, e `cd frontend` para `yarn`.
