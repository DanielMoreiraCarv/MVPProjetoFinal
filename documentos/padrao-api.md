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
