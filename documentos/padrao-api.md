# Padrão de Nomenclatura e Contrato da API (S1-02)

Este documento estabelece as diretrizes arquiteturais para os contratos de comunicação HTTP (APIs REST) entre o front-end (Next.js) e o back-end (Spring Boot 3.5), conforme definido no planejamento da **Sprint 1** (Atividade **S1-02**). O objetivo deste padrão é eliminar inconsistências de idioma, formato e tipagem, garantindo uma integração robusta, segura e sem quebras de contrato.

---

## 1. Diretrizes de Endpoints (URIs)

Os nomes dos endpoints devem seguir as seguintes convenções de nomenclatura:

1. **Prefixo de Versão:** Todos os endpoints devem ser prefixados com `/api/v1`.
2. **Caixa e Separadores:** O caminho (path) das URIs deve utilizar letras minúsculas com termos separados por sublinhado (**snake_case**).
3. **Singular:** Os nomes dos recursos expostos devem ser escritos no **singular**.
4. **Idioma:** Todas as URIs devem ser escritas em **Português (PT-BR)**, em total alinhamento com o modelo de domínio do glossário unificado.

### Exemplos de URIs Padronizadas:
*   `/api/v1/usuario`
*   `/api/v1/tipo_esporte`
*   `/api/v1/detalhe_partida`
*   `/api/v1/sumula_partida`
*   `/api/v1/administracao`

---

## 2. Estrutura do JSON: Envelope de Resposta (Sucesso)

Para garantir consistência no consumo de dados pelo cliente, todas as respostas de sucesso da API (HTTP Status `2xx`) devem obrigatoriamente seguir a estrutura envelopada, onde os dados reais residem dentro da propriedade principal chamada `resultado`.

### 2.1 Resposta de Objeto Único / Detalhe
Quando a rota retorna uma única entidade ou detalhe:

```json
{
  "resultado": {
    "id": 42,
    "nomeCompleto": "Daniel de Carvalho Moreira",
    "email": "daniel@exemplo.com",
    "dataCadastro": "2026-08-19T14:30:00Z"
  }
}
```

### 2.2 Resposta de Listagem (Arrays)
Quando a rota retorna uma lista de registros:

```json
{
  "resultado": [
    {
      "id": 1,
      "nomeEquipe": "Panteras Negras",
      "modalidade": "FUTEBOL"
    },
    {
      "id": 2,
      "nomeEquipe": "Águias do Vale",
      "modalidade": "FUTEBOL"
    }
  ]
}
```

### 2.3 Resposta com Paginação
Para endpoints que requerem paginação (conforme RNF/requisitos do projeto), os metadados de controle devem vir irmãos do array de resultados dentro do próprio envelope ou explicitados de forma estruturada:

```json
{
  "resultado": {
    "conteudo": [
      {
        "id": 10,
        "nomeAtleta": "Filipe Tavares",
        "numeroCamisa": 9
      }
    ],
    "paginacao": {
      "paginaAtual": 0,
      "tamanhoPagina": 10,
      "totalElementos": 85,
      "totalPaginas": 9,
      "ultimaPagina": false
    }
  }
}
```

---

## 3. Padrão de Chaves e Valores no JSON

Para evitar conflitos na desserialização de dados e validações (ex: schemas Zod no front-end e Records no back-end), estabelecemos as seguintes regras:

1. **Chaves (Campos do Objeto):** Devem seguir o padrão **camelCase** (ex: `idCompeticao`, `dataHoraPartida`, `golsMandante`).
2. **Idiomas das Chaves:** Sempre em **Português (PT-BR)**.
3. **Valores de Enums:** Devem ser trafegados como strings no formato **SCREAMING_SNAKE** (ex: `PONTOS_CORRIDOS`, `EM_ANDAMENTO`, `FUTEBOL_DE_CAMPO`, `CARTAO_AMARELO`). Caberá ao front-end traduzir ou formatar estas constantes para exibição amigável na tela.
4. **Data e Hora:** Devem seguir rigorosamente o padrão internacional **ISO-8601** em UTC (ex: `"2026-02-07T09:00:00Z"`). Nunca enviar inteiros puros (epoch) ou strings de formato livre (ex: `"09:00h"`).
5. **Relacionamentos (Chaves Primárias/Estrangeiras):** Devem sempre ser referenciados por IDs numéricos (`Long`/`Number`) (ex: `idTimeMandante: 12`), eliminando relacionamentos frágeis baseados em strings de nomes textuais.

---

## 4. Estrutura do JSON: Envelope de Resposta (Erro)

Para cumprir o requisito não funcional **RNF07** (mensagens de erro claras com causa e ação corretiva), quando uma requisição falhar (HTTP Status `4xx` ou `5xx`), a API retornará uma estrutura de erro padronizada contendo detalhes do problema:

```json
{
  "erro": {
    "codigo": "VALIDACAO_FALHOU",
    "mensagem": "A validação dos dados de entrada falhou. Verifique os campos enviados.",
    "detalhes": [
      {
        "campo": "dataHora",
        "mensagem": "A data e hora da partida não podem ser definidas no passado."
      },
      {
        "campo": "idTimeVisitante",
        "mensagem": "O time visitante deve ser diferente do time mandante."
      }
    ]
  }
}
```

---

## 5. Mapeamento de Rotas Iniciais da Sprint 1

Com base nas decisões tomadas, os primeiros endpoints a serem implementados ou adequados na camada de Controllers do backend são:

| Método | Endpoint (snake_case) | Descrição | Envelope do `resultado` |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/login` | Autenticação e geração de JWT | `{ "token": "string", "usuario": { ... } }` |
| **GET** | `/api/v1/usuario` | Lista todos os usuários | `[ { "id": 1, ... } ]` |
| **GET** | `/api/v1/competicao` | Lista competições (antigo campeonato) | `[ { "id": 10, ... } ]` |
| **POST** | `/api/v1/time` | Cadastro de nova equipe (antigo time) | `{ "id": 3, "nomeEquipe": "..." }` |
| **POST** | `/api/v1/atleta` | Cadastro de novo atleta (antigo jogador) | `{ "id": 45, "nomeAtleta": "..." }` |
| **GET** | `/api/v1/arbitro` | Lista árbitros disponíveis | `[ { "id": 5, "nome": "..." } ]` |


---

## 6. O que já vale e o que ainda não

**Vale:** o envelope de erro da §4, em toda falha, produzido por um
`@RestControllerAdvice` só. Os códigos em uso são `VALIDACAO_FALHOU`,
`NAO_ENCONTRADO`, `CONFLITO`, `REGRA_VIOLADA`, `ENTRADA_INVALIDA`,
`ROTA_INEXISTENTE` e `ERRO_INTERNO`. Mensagem de exceção interna nunca vai
para a resposta: o que o cliente pode corrigir vira 4xx com a causa, o resto
vira 500 genérico com o stack no log.

**Vale:** o vocabulário do glossário nas rotas e nos campos, e o recurso no
singular.

**Ainda não vale:** o envelope de sucesso da §2 (`{ "resultado": ... }`). As
rotas devolvem o DTO cru. Mexer nisso toca todas as rotas e todos os parsers
do front de uma vez, e nenhuma tela consome a diferença — ficou registrado
como evolução, não como dívida urgente.

**Ainda não vale:** paginação (§2.3). Nenhum `listar` pagina.


---

## 7. Rotas por recurso

O que existe hoje. Toda falha responde com o envelope da §4.

### Administração
```
GET    /api/v1/administracao            POST   /api/v1/administracao
GET    /api/v1/administracao/{id}       PUT    /api/v1/administracao/{id}
DELETE /api/v1/administracao/{id}
```

### Competição
```
GET    /api/v1/competicao[?idAdministracao=]
POST   /api/v1/competicao
GET    /api/v1/competicao/{id}          PUT    /api/v1/competicao/{id}
DELETE /api/v1/competicao/{id}
PUT    /api/v1/competicao/{id}/estado   -> { "estado": "EM_ANDAMENTO" }
POST   /api/v1/competicao/{id}/equipe/{idEquipe}     inscreve
DELETE /api/v1/competicao/{id}/equipe/{idEquipe}     remove a inscrição
```

Estados: `RASCUNHO -> EM_ANDAMENTO -> ENCERRADA`, e `CANCELADA` alcançável das
duas primeiras. Nenhuma transição é reversível. Publicar exige duas equipes
inscritas. Encerrada e cancelada não aceitam mudança de inscrição.

### Equipe e atleta
```
GET    /api/v1/equipe[?idModalidade=]   POST   /api/v1/equipe
GET    /api/v1/equipe/{id}              PUT    /api/v1/equipe/{id}
DELETE /api/v1/equipe/{id}
GET    /api/v1/equipe/{id}/atleta                    o elenco
POST   /api/v1/equipe/{id}/atleta/{idAtleta}         traz para a equipe
DELETE /api/v1/equipe/{id}/atleta/{idAtleta}         tira da equipe, sem apagar

GET    /api/v1/atleta[?idEquipe=]       POST   /api/v1/atleta
GET    /api/v1/atleta/{id}              PUT    /api/v1/atleta/{id}
DELETE /api/v1/atleta/{id}
```

O elenco é derivado de `atleta.equipe_id`. Havia uma segunda fonte — a
associativa `equipe_atleta` — e as duas podiam discordar; a V8 derrubou a
associativa.

### Partida e súmula
```
GET    /api/v1/partida                  POST   /api/v1/partida
GET    /api/v1/partida/{id}             PUT    /api/v1/partida/{id}
DELETE /api/v1/partida/{id}
GET    /api/v1/partida/competicao/{id}  GET    /api/v1/partida/equipe/{id}
GET    /api/v1/partida/acompanhamento[?realizada=]
PUT    /api/v1/partida/{id}/agendamento -> { "dataHora": ISO-8601, "local": "…" }
PUT    /api/v1/partida/{id}/placar?placarMandante=&placarVisitante=
PUT    /api/v1/partida/{id}/escalar-arbitro?idArbitro=
POST   /api/v1/partida/{id}/finalizar

GET    /api/v1/sumula[?assinada=]       POST   /api/v1/sumula
GET    /api/v1/sumula/{id}              PUT    /api/v1/sumula/{id}
DELETE /api/v1/sumula/{id}
GET    /api/v1/sumula/partida/{idPartida}
GET    /api/v1/sumula/arbitro/{idArbitro}
POST   /api/v1/sumula/{id}/ocorrencia   POST   /api/v1/sumula/{id}/finalizar
```

Regras: equipe tem que estar inscrita na competição para jogar; mandante e
visitante têm que ser diferentes; partida encerrada não aceita troca de placar
nem de árbitro; súmula assinada é imutável.

`PartidaResponse` traz a equipe como `{id, nome}`, e não o elenco inteiro:
antes treze partidas devolviam 50 KB.

### Fase
```
GET    /api/v1/fase[?idCompeticao=]     POST   /api/v1/fase
GET    /api/v1/fase/{id}                PUT    /api/v1/fase/{id}
DELETE /api/v1/fase/{id}
GET    /api/v1/fase/{id}/validacao      diz se dá para montar, e o que falta
POST   /api/v1/fase/{id}/confrontos     gera
PUT    /api/v1/fase/{id}/confrontos     recalcula, com opções
GET    /api/v1/fase/{id}/classificacao
GET    /api/v1/fase/atributo?tipoFase=  o catálogo de configuração do tipo
GET    /api/v1/fase/{id}/atributo       o catálogo com os valores da instância
PUT    /api/v1/fase/{id}/atributo/{codigo} -> { "valor": "…" }
```

Formatos: `PONTOS_CORRIDOS`, `GRUPOS`, `ELIMINATORIA` — os três com estratégia
registrada. As duas rotas de atributo são o que permite um formulário de
configuração se montar a partir do que a estratégia declara.

### Apoio
```
GET    /api/v1/modalidade   GET /api/v1/modalidade/{id}      (só leitura)
GET    /api/v1/federacao    POST /api/v1/federacao
PUT    /api/v1/federacao/{id}   DELETE /api/v1/federacao/{id}
GET    /api/v1/arbitro      POST /api/v1/arbitro
PUT    /api/v1/arbitro/{id}     DELETE /api/v1/arbitro/{id}
GET    /api/v1/sancao       POST /api/v1/sancao
PUT    /api/v1/sancao/{id}      DELETE /api/v1/sancao/{id}
GET    /api/v1/sancao_atleta    POST /api/v1/sancao_atleta
PUT    /api/v1/sancao_atleta/{id}
PUT    /api/v1/sancao_atleta/{id}/inativar
DELETE /api/v1/sancao_atleta/{id}
GET    /api/v1/tabela/competicao/{id}
```
