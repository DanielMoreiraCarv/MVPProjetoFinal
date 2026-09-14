const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
    constructor(readonly status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

const mensagemDeErro = async (resposta: Response) => {
    // O backend ainda não tem contrato de erro padronizado: às vezes responde
    // sem corpo, às vezes com o stack do Spring. Extrai o que der.
    const texto = await resposta.text().catch(() => "");
    if (!texto) return `A requisição falhou (HTTP ${resposta.status}).`;

    try {
        const corpo = JSON.parse(texto);
        return corpo.mensagem ?? corpo.message ?? corpo.error ?? texto;
    } catch {
        return texto;
    }
};

export const apiFetch = async <T>(caminho: string, init?: RequestInit): Promise<T> => {
    const resposta = await fetch(`${baseUrl}${caminho}`, {
        ...init,
        cache: "no-store",
        headers: { "Content-Type": "application/json", ...init?.headers },
    });

    if (!resposta.ok) {
        throw new ApiError(resposta.status, await mensagemDeErro(resposta));
    }

    if (resposta.status === 204) {
        return undefined as T;
    }

    return resposta.json() as Promise<T>;
};
