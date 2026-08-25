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

Configurar no projeto do Vercel: `DB_URL`, `DB_USER`, `DB_PASSWORD`,
`FLYWAY_DB_URL` e `DB_POOL_SIZE`. Memória e duração máxima ficam nas
configurações do projeto.

O que muda em relação a um servidor sempre ligado:

- **Escala a zero.** Sem tráfego por 5 minutos em produção (30 segundos em
  preview), a instância é desligada. A requisição seguinte paga a subida da
  JVM mais o Flyway — medido em 3,2 s no container. Para uma apresentação de
  banca, vale aquecer a API antes.
- **Encerramento.** O container recebe `SIGTERM` com 30 s de carência, por
  isso `server.shutdown=graceful`.
- **Conexões.** Várias instâncias sobem em paralelo. O pool do Hikari fica
  pequeno por instância (`DB_POOL_SIZE`, default 5) e a aplicação deve usar o
  *pooler de transação* do Supabase (porta 6543), não a conexão direta.
- **Flyway.** O pooler de transação não suporta o advisory lock que o Flyway
  usa. Por isso `FLYWAY_DB_URL` aponta para a **conexão direta** (porta 5432),
  enquanto `DB_URL` aponta para o pooler.
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

Se os dois repositórios forem unificados, o Vercel roteia por serviço:

```json
{
  "services": {
    "frontend": { "root": "tcc-front/", "entrypoint": "Dockerfile.vercel" },
    "backend":  { "root": "MVPProjetoFinal/", "entrypoint": "Dockerfile.vercel" }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "backend" } },
    { "source": "/(.*)",     "destination": { "service": "frontend" } }
  ]
}
```

Isso eliminaria o CORS entre front e API, já que passariam a compartilhar
origem. Enquanto os repositórios forem separados, são dois projetos no Vercel.
