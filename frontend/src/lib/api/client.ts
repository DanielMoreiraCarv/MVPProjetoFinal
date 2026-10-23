/**
 * O navegador chama a API pelo próprio site. A rota /api/v1 do Next anexa o
 * token guardado no cookie httpOnly e repassa ao servidor da API.
 */
const baseUrl = "/api/v1";

/**
 * Sessão vencida de vez no meio de uma tela da gestão: volta para a entrada e,
 * depois de entrar, para onde estava. O acompanhamento público não tem sessão
 * a perder, então o 401 dele segue como erro comum.
 */
const CHAVE_DA_ULTIMA_VOLTA = "tcc.ultima-volta-a-entrada";

const voltarParaAEntrada = () => {
    if (typeof window === "undefined") return;
    // Uma vez a cada 15 s: se a API recusar até um token recém-renovado, a
    // tela mostra o erro em vez de ficar indo e voltando da entrada.
    try {
        const ultima = Number(sessionStorage.getItem(CHAVE_DA_ULTIMA_VOLTA));
        if (Date.now() - ultima < 15_000) return;
        sessionStorage.setItem(CHAVE_DA_ULTIMA_VOLTA, String(Date.now()));
    } catch {
        // Sem sessionStorage (aba privada restrita): volta mesmo assim.
    }
    const aqui = window.location.pathname + window.location.search;
    window.location.assign(`/entrar?de=${encodeURIComponent(aqui)}`);
};

/**
 * Quem lê. O acompanhamento por link usa as rotas `/publico`, que o servidor
 * só responde para competição aberta ao público e sem dado pessoal de atleta.
 */
export type Acesso = "gestao" | "publico";

export const rotaPara = (acesso: Acesso, caminho: string) =>
    acesso === "publico" ? `/publico${caminho}` : caminho;

/** Uma falha atribuída a um campo do formulário que foi enviado. */
export type DetalheDeErro = { campo: string; mensagem: string };

export class ApiError extends Error {
    constructor(
        readonly status: number,
        message: string,
        /** `VALIDACAO_FALHOU`, `NAO_ENCONTRADO`, `CONFLITO`… */
        readonly codigo?: string,
        readonly detalhes: DetalheDeErro[] = [],
    ) {
        super(message);
        this.name = "ApiError";
    }

    /** A mensagem para um campo, quando o servidor disse qual. */
    mensagemDoCampo(campo: string) {
        return this.detalhes.find((detalhe) => detalhe.campo === campo)?.mensagem;
    }

    get ehValidacao() {
        return this.codigo === "VALIDACAO_FALHOU";
    }
}

/**
 * O contrato de erro de `documentos/padrao-api.md` §4:
 *
 *     { "erro": { "codigo": "…", "mensagem": "…", "detalhes": [ { campo, mensagem } ] } }
 *
 * Respostas antigas sem envelope ainda aparecem enquanto alguma rota não
 * passar pelo tratador central, então o texto cru continua servindo de
 * último recurso — é melhor mostrar o que veio do que "erro desconhecido".
 */
const erroDaResposta = async (resposta: Response) => {
    const texto = await resposta.text().catch(() => "");
    if (!texto) {
        return new ApiError(resposta.status, `A requisição falhou (HTTP ${resposta.status}).`);
    }

    try {
        const corpo = JSON.parse(texto);
        const erro = corpo?.erro;

        if (erro?.mensagem) {
            return new ApiError(
                resposta.status,
                erro.mensagem,
                erro.codigo,
                Array.isArray(erro.detalhes) ? erro.detalhes : [],
            );
        }

        return new ApiError(
            resposta.status,
            corpo.mensagem ?? corpo.message ?? corpo.error ?? texto,
        );
    } catch {
        return new ApiError(resposta.status, texto);
    }
};

export const apiFetch = async <T>(caminho: string, init?: RequestInit): Promise<T> => {
    const resposta = await fetch(`${baseUrl}${caminho}`, {
        ...init,
        cache: "no-store",
        headers: { "Content-Type": "application/json", ...init?.headers },
    });

    if (!resposta.ok) {
        if (resposta.status === 401 && !caminho.startsWith("/publico")) voltarParaAEntrada();
        throw await erroDaResposta(resposta);
    }

    if (resposta.status === 204) {
        return undefined as T;
    }

    // Há rota que responde 200 com corpo vazio — `GET /arbitro` faz isso
    // quando não existe nenhum árbitro. `resposta.json()` estoura com erro de
    // sintaxe nesse caso, e a tela mostrava "Unexpected end of JSON input" no
    // lugar de uma lista vazia. Quem chama resolve o vazio com `?? []`.
    const texto = await resposta.text();
    if (!texto) {
        return undefined as T;
    }

    return JSON.parse(texto) as T;
};
