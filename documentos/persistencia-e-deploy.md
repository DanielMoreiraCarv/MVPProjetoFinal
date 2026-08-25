# Persistência e Deploy

## 1. Onde os dados moram

| Ambiente | Banco | Como o esquema chega lá |
|---|---|---|
| Desenvolvimento | Postgres 16 em container local (podman) | Flyway, no start da aplicação |
| Produção | Postgres gerenciado do **Supabase** | Flyway, no start da aplicação |

O H2 em memória foi removido. Todo dado se perdia no restart e o dialeto
divergia do Postgres, o que escondia problemas até o deploy.

O esquema pertence ao **Flyway**: as migrações versionadas em
`src/main/resources/db/migration` são a única fonte de verdade. O Hibernate roda
com `ddl-auto=validate` — ele confere se o mapeamento corresponde ao que as
migrações criaram e **recusa subir** se divergirem, em vez de alterar tabelas
por conta própria.

Toda mudança de modelo exige uma migração nova (`V2__...`, `V3__...`).
Migração já aplicada nunca é editada.

## 2. Configuração

Nenhuma credencial no repositório. A aplicação lê três variáveis:

| Variável | Default (desenvolvimento) | Produção |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/tcc` | connection string do Supabase |
| `DB_USER` | `tcc` | usuário do Supabase |
| `DB_PASSWORD` | `tcc` | senha do Supabase |
| `JPA_SHOW_SQL` | `false` | `false` |

Os defaults existem só para que `mvn spring-boot:run` funcione contra o pod
local. Em produção as três são obrigatórias e vêm do ambiente do PaaS.

A porta 5433 no host evita colisão com um Postgres já instalado na máquina.

## 3. Rodando localmente

**Só o banco** (API pela IDE ou por `mvn spring-boot:run`):

```bash
podman play kube deploy/postgres-local.yaml
mvn spring-boot:run
```

**Banco + API**, tudo em container:

```bash
podman build -t tcc-api:dev .
podman play kube deploy/desenvolvimento.yaml
curl localhost:8080/api/v1/modalidade
```

Derrubar:

```bash
podman play kube --down deploy/desenvolvimento.yaml
```

Os manifestos são Pod do Kubernetes, lidos pelo `podman play kube`. Os dois
containers do `desenvolvimento.yaml` compartilham a rede do pod, por isso a API
alcança o banco em `localhost:5432`.

## 4. Deploy

A aplicação é distribuída como imagem de container (`Dockerfile`, build em dois
estágios: Maven para compilar, JRE para rodar).

**Atenção ao destino.** O Vercel hospeda o front-end Next.js; ele não roda um
processo Java de longa duração. A API precisa de um PaaS de container
(Railway, Render ou Fly.io). A topologia de produção é:

```
Vercel (Next.js)  ->  PaaS de container (Spring Boot)  ->  Supabase (Postgres)
```

Para apontar a API ao Supabase, basta preencher `DB_URL`, `DB_USER` e
`DB_PASSWORD` com os dados de *Connection string* do projeto Supabase. O Flyway
aplica as migrações no primeiro start.
