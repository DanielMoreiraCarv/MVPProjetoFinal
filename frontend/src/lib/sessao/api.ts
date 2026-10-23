import {
    COOKIE_DE_ACESSO,
    COOKIE_DE_RENOVACAO,
    COOKIE_DO_USUARIO,
    UsuarioDaSessao,
} from "./sessao";

/**
 * Onde o servidor do Next encontra a API. Só o servidor fala com ela: o
 * navegador chama /api/v1 do próprio site, e é o Next que anexa o token.
 */
export const API_URL =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

/** O que /auth/login e /auth/renovar devolvem. */
export type RespostaDeAutenticacao = {
    token: string;
    expiraEm: string;
    tokenRenovacao: string;
    usuario: { nome: string; email: string; papeis: { codigo: string }[] };
};

export type CookieDaSessao = {
    name: string;
    value: string;
    httpOnly: true;
    sameSite: "lax";
    secure: boolean;
    path: "/";
    maxAge: number;
};

/** O mesmo prazo do servidor (`auth.renovacao.validade-dias`). */
const VALIDADE_DA_RENOVACAO_EM_SEGUNDOS = 60 * 60 * 24 * 7;

/**
 * O cookie de acesso some meio minuto antes do token vencer: sem ele, a
 * próxima navegação renova antes de chamar a API, em vez de levar um 401 no
 * meio de uma tela.
 */
const FOLGA_ANTES_DE_VENCER_EM_SEGUNDOS = 30;

const cookie = (name: string, value: string, maxAge: number): CookieDaSessao => ({
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
});

export const usuarioDaResposta = (resposta: RespostaDeAutenticacao): UsuarioDaSessao => ({
    nome: resposta.usuario.nome,
    email: resposta.usuario.email,
    papeis: resposta.usuario.papeis.map((papel) => papel.codigo),
});

export const cookiesDaSessao = (resposta: RespostaDeAutenticacao): CookieDaSessao[] => {
    const segundosAteVencer = Math.floor((Date.parse(resposta.expiraEm) - Date.now()) / 1000);

    return [
        cookie(
            COOKIE_DE_ACESSO,
            resposta.token,
            Math.max(segundosAteVencer - FOLGA_ANTES_DE_VENCER_EM_SEGUNDOS, 0),
        ),
        cookie(COOKIE_DE_RENOVACAO, resposta.tokenRenovacao, VALIDADE_DA_RENOVACAO_EM_SEGUNDOS),
        cookie(
            COOKIE_DO_USUARIO,
            JSON.stringify(usuarioDaResposta(resposta)),
            VALIDADE_DA_RENOVACAO_EM_SEGUNDOS,
        ),
    ];
};

export const cookiesEncerrados = (): CookieDaSessao[] =>
    [COOKIE_DE_ACESSO, COOKIE_DE_RENOVACAO, COOKIE_DO_USUARIO].map((nome) => cookie(nome, "", 0));

/** A mensagem do contrato de erro da API, ou um texto de reserva. */
export const mensagemDeErro = async (resposta: Response, reserva: string) => {
    const corpo = await resposta.json().catch(() => null);
    return typeof corpo?.erro?.mensagem === "string" ? corpo.erro.mensagem : reserva;
};

export const chamarAutenticacao = (caminho: string, corpo: object) =>
    fetch(`${API_URL}/auth/${caminho}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
        cache: "no-store",
    });

/**
 * O token de renovação é de uso único, e o servidor trata o segundo uso como
 * roubo: derruba todas as sessões do usuário. Uma tela abre várias chamadas
 * ao mesmo tempo, e todas chegam com o mesmo token vencido — sem isto, a
 * segunda renovação encerraria a sessão de quem só abriu uma página.
 *
 * Por isso a renovação é uma só por token, e o resultado fica guardado alguns
 * segundos para as chamadas que saíram do navegador antes do cookie novo.
 */
const renovacoes = new Map<string, Promise<RespostaDeAutenticacao | null>>();
const GUARDA_DA_RENOVACAO_MS = 30_000;

export const renovarSessao = (tokenRenovacao: string) => {
    const emAndamento = renovacoes.get(tokenRenovacao);
    if (emAndamento) return emAndamento;

    const renovacao = chamarAutenticacao("renovar", { tokenRenovacao })
        .then((resposta) => (resposta.ok ? (resposta.json() as Promise<RespostaDeAutenticacao>) : null))
        .catch(() => null);

    renovacoes.set(tokenRenovacao, renovacao);
    setTimeout(() => renovacoes.delete(tokenRenovacao), GUARDA_DA_RENOVACAO_MS);
    return renovacao;
};
