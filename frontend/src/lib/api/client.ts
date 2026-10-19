const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

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
