"use client";

import { Toast } from "@base-ui/react/toast";

/**
 * Retorno de escrita em uma linha. Toda tela usa isto no lugar de inventar
 * uma faixa de sucesso própria.
 *
 *     const avisos = useAvisos();
 *     avisos.sucesso("Competição criada.");
 *     avisos.erro(causa);
 */
export const useAvisos = () => {
    const gerenciador = Toast.useToastManager();

    return {
        sucesso: (titulo: string, descricao?: string) =>
            gerenciador.add({ title: titulo, description: descricao, type: "sucesso" }),

        aviso: (titulo: string, descricao?: string) =>
            gerenciador.add({ title: titulo, description: descricao, type: "aviso" }),

        /**
         * Aceita o erro cru: a mensagem do contrato de erro da API já vem
         * pronta para leitura, e o que não for Error vira texto genérico em
         * vez de "[object Object]" na tela.
         */
        erro: (causa: unknown, titulo = "Não deu certo") =>
            gerenciador.add({
                title: titulo,
                description:
                    causa instanceof Error
                        ? causa.message
                        : typeof causa === "string"
                          ? causa
                          : "Tente de novo em instantes.",
                type: "erro",
                // Erro fica até a pessoa fechar: some sozinho é como se perde
                // a única explicação do que aconteceu.
                timeout: 0,
            }),
    };
};
