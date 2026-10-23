#!/usr/bin/env node
/**
 * Roda os schemas do front contra a API no ar.
 *
 * `yarn build` prova que o código compila; não prova que a resposta do
 * servidor tem a forma que a tela espera. Este script fecha essa lacuna: cada
 * caso pede uma rota de verdade e valida o corpo com o mesmo Zod que a tela
 * usa. Foi ele que pegou o dia em que o placar parou de ser extraído e a tabela
 * de classificação passou a calcular tudo zero.
 *
 *     ./deploy/ambiente.sh subir
 *     cd frontend && yarn contrato
 *
 * Se uma rota mudar de forma, este script falha antes da tela.
 */
import { z } from "zod";

const base = process.env.API ?? "http://localhost:8080/api/v1";

// A gestão exige login. Por padrão, a organização do conjunto de teste.
const entrada = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        email: process.env.CONTRATO_EMAIL ?? "organizador@meutorneio.app",
        senha: process.env.CONTRATO_SENHA ?? "torneio123",
    }),
});
if (!entrada.ok) {
    console.error(`Não foi possível entrar na API (HTTP ${entrada.status}). Carregue os dados de teste.`);
    process.exit(1);
}
const { token } = await entrada.json();

const pegar = async (caminho) => {
    const resposta = await fetch(base + caminho, {
        headers: caminho.startsWith("/publico") ? {} : { Authorization: `Bearer ${token}` },
    });
    const texto = await resposta.text();
    if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status} em ${caminho}: ${texto.slice(0, 200)}`);
    }
    return texto ? JSON.parse(texto) : undefined;
};

/* ------------------------------------------------------------ schemas ----- */

const equipeResumo = z.object({ id: z.number(), nome: z.string() }).nullable();

const administracao = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string().nullable(),
});

const modalidade = z.object({
    id: z.number(),
    codigo: z.string(),
    nome: z.string(),
    // Renomeado na V7: o schema do front pedia `jogadoresEmQuadra` e a lista
    // inteira era descartada em silêncio.
    atletasEmQuadra: z.number(),
});

const competicao = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string().nullable(),
    categoria: z.string().nullable(),
    idAdministracao: z.number().nullable(),
    modalidades: z.array(z.object({ id: z.number(), nome: z.string().nullable() })).nullable(),
    isMataMata: z.boolean().nullable(),
    equipes: z.array(z.object({ id: z.number(), nome: z.string() }).passthrough()).nullable(),
    estado: z.enum(["RASCUNHO", "EM_ANDAMENTO", "ENCERRADA", "CANCELADA"]),
    publica: z.boolean(),
});

const partida = z.object({
    id: z.number(),
    equipeMandante: equipeResumo,
    equipeVisitante: equipeResumo,
    nomeCompeticao: z.string().nullable(),
    idCompeticao: z.number().nullable(),
    vencedor: z.string().nullable(),
    realizada: z.boolean().nullable(),
    fase: z.string().nullable(),
    // Números, e não a string "2 x 1" que o cliente partia ao meio.
    placarMandante: z.number().nullable(),
    placarVisitante: z.number().nullable(),
    dataHora: z.string().nullable(),
    local: z.string().nullable(),
});

const equipe = z.object({
    id: z.number(),
    nome: z.string(),
    federacao: z.object({ id: z.number() }).passthrough().nullable(),
    atletas: z.array(z.object({ id: z.number(), nome: z.string() }).passthrough()).nullable(),
    modalidade: z.object({ id: z.number(), nome: z.string() }).passthrough().nullable(),
});

const atleta = z.object({
    id: z.number(),
    nome: z.string(),
    idade: z.number().nullable(),
    numCamisa: z.number().nullable(),
    cpf: z.string().nullable(),
});

const arbitro = z.object({
    id: z.number(),
    nome: z.string().nullable(),
    federacao: z.string().nullable(),
    // Entrava no POST, era gravada e não voltava na leitura.
    categoria: z.string().nullable(),
    partidasApitadas: z.number().nullable(),
});

const federacao = z.object({ id: z.number(), nome: z.string().nullable() });

const fase = z.object({
    id: z.number(),
    nome: z.string().nullable(),
    ordem: z.number().nullable(),
    // A constante que o pedido exige, não a descrição.
    fasePartida: z.enum(["PONTOS_CORRIDOS", "GRUPOS", "ELIMINATORIA"]).nullable(),
    qtdClassificados: z.number().nullable(),
    idFaseSucessora: z.number().nullable(),
});

const atributoDeFase = z.object({
    codigo: z.string(),
    tipoDado: z.string(),
    obrigatorio: z.boolean(),
    valorPadrao: z.string().nullable(),
    descricao: z.string().nullable(),
    valor: z.string().nullable(),
});

const casos = [
    ["GET /administracao", z.array(administracao), "/administracao"],
    ["GET /modalidade", z.array(modalidade), "/modalidade"],
    ["GET /federacao", z.array(federacao), "/federacao"],
    ["GET /arbitro", z.array(arbitro), "/arbitro"],
    ["GET /competicao", z.array(competicao.passthrough()), "/competicao"],
    ["GET /competicao/1", competicao.passthrough(), "/competicao/1"],
    ["GET /equipe", z.array(equipe.passthrough()), "/equipe"],
    ["GET /equipe/1", equipe.passthrough(), "/equipe/1"],
    ["GET /equipe/1/atleta", z.array(atleta.passthrough()), "/equipe/1/atleta"],
    ["GET /atleta?idEquipe=1", z.array(atleta.passthrough()), "/atleta?idEquipe=1"],
    ["GET /partida/competicao/1", z.array(partida.passthrough()), "/partida/competicao/1"],
    ["GET /partida/1", partida.passthrough(), "/partida/1"],
    ["GET /partida/equipe/1", z.array(partida.passthrough()), "/partida/equipe/1"],
    ["GET /fase?idCompeticao=1", z.array(fase.passthrough()), "/fase?idCompeticao=1"],
    [
        "GET /fase/atributo?tipoFase=PONTOS_CORRIDOS",
        z.array(atributoDeFase),
        "/fase/atributo?tipoFase=PONTOS_CORRIDOS",
    ],
    [
        "GET /competicao/1/pessoas",
        z.object({
            participantes: z.array(
                z.object({ id: z.number(), nome: z.string(), email: z.string(), voce: z.boolean() }),
            ),
            convites: z.array(z.object({ id: z.number(), email: z.string(), criadoEm: z.string() })),
        }),
        "/competicao/1/pessoas",
    ],
    // O acompanhamento por link lê pelas rotas públicas, com os mesmos
    // schemas. A competição 1 é aberta ao público no conjunto de teste.
    ["GET /publico/competicao", z.array(competicao.passthrough()), "/publico/competicao"],
    ["GET /publico/competicao/1", competicao.passthrough(), "/publico/competicao/1"],
    ["GET /publico/partida/competicao/1", z.array(partida.passthrough()), "/publico/partida/competicao/1"],
    ["GET /publico/partida/1", partida.passthrough(), "/publico/partida/1"],
    ["GET /publico/equipe/1/atleta", z.array(atleta.passthrough()), "/publico/equipe/1/atleta"],
    ["GET /publico/fase?idCompeticao=1", z.array(fase.passthrough()), "/publico/fase?idCompeticao=1"],
];

let falhas = 0;

for (const [nome, schema, caminho] of casos) {
    try {
        const resultado = schema.safeParse((await pegar(caminho)) ?? []);
        if (resultado.success) {
            console.log(`ok    ${nome}`);
        } else {
            falhas++;
            console.log(`FALHA ${nome}`);
            console.log(`      ${JSON.stringify(resultado.error.issues.slice(0, 3))}`);
        }
    } catch (causa) {
        falhas++;
        console.log(`FALHA ${nome}\n      ${causa.message}`);
    }
}

/* ------------------------------------------------ o que a tela deriva ----- */

const partidas = await pegar("/partida/competicao/1");
const comPlacar = partidas.filter(
    (p) => typeof p.placarMandante === "number" && typeof p.placarVisitante === "number",
).length;

console.log(`\nplacar presente em ${comPlacar}/${partidas.length} partidas da competição 1`);
if (comPlacar !== partidas.length) {
    console.log("FALHA o placar não veio em todas as partidas");
    falhas++;
}

// O elenco tem duas leituras, e elas não podem discordar: foi por isso que a
// associativa `equipe_atleta` saiu do esquema na V8.
const [porEquipe, porFiltro] = await Promise.all([
    pegar("/equipe/1"),
    pegar("/atleta?idEquipe=1"),
]);
const aninhados = new Set((porEquipe.atletas ?? []).map((a) => a.id));
const filtrados = new Set((porFiltro ?? []).map((a) => a.id));
const iguais =
    aninhados.size === filtrados.size && [...aninhados].every((id) => filtrados.has(id));

console.log(
    `elenco da equipe 1: ${aninhados.size} aninhados, ${filtrados.size} filtrados — ${iguais ? "iguais" : "DIVERGEM"}`,
);
if (!iguais) falhas++;

// Pela rota pública, atleta sai sem CPF e sem idade, e competição fechada
// não sai — a 2 é privada no conjunto de teste.
const elencoPublico = await pegar("/publico/equipe/1/atleta");
const comDadoPessoal = elencoPublico.filter((a) => a.cpf != null || a.idade != null).length;
console.log(`elenco público da equipe 1: ${comDadoPessoal} atleta(s) com CPF ou idade`);
if (comDadoPessoal > 0) falhas++;

const fechada = await fetch(`${base}/publico/competicao/2`);
console.log(`competição 2 (privada) pela rota pública: HTTP ${fechada.status}`);
if (fechada.status !== 404) falhas++;

process.exit(falhas ? 1 : 0);
