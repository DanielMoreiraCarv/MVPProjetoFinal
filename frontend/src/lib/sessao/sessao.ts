export const COOKIE_DA_SESSAO = "tcc.sessao";

/** Oito horas: um dia de jogos à beira do campo sem pedir a senha de novo. */
export const DURACAO_DA_SESSAO_EM_SEGUNDOS = 60 * 60 * 8;

export type Organizador = { nome: string; email: string };

/**
 * O único acesso enquanto a API de usuários não chega. Não é segredo — a tela
 * de entrada mostra estes dados para a banca e para quem testa. Quando o login
 * de verdade existir, `entrar` passa a perguntar à API e este objeto some.
 */
export const ORGANIZADOR_DE_DEMONSTRACAO = {
    nome: "Organização Demo",
    email: "organizador@meutorneio.app",
    senha: "torneio123",
} as const;

export const organizadorDaSessao = (valor: string | undefined): Organizador | null =>
    valor === ORGANIZADOR_DE_DEMONSTRACAO.email
        ? { nome: ORGANIZADOR_DE_DEMONSTRACAO.nome, email: ORGANIZADOR_DE_DEMONSTRACAO.email }
        : null;

export const PAINEL = "/inicio";

/**
 * Para onde voltar depois de entrar. Só caminho deste site: aceitar o `de`
 * da URL como veio deixaria um link `/entrar?de=https://outro.site` mandar a
 * pessoa, já autenticada, para fora.
 */
export const destinoSeguro = (de: unknown) =>
    typeof de === "string" && de.startsWith("/") && !de.startsWith("//") && !de.startsWith("/\\")
        ? de
        : PAINEL;
