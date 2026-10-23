"use client";

import { createContext, useContext } from "react";

import { Acesso } from "@/src/lib/api/client";

export const enderecoPublicoDaCompeticao = (idCompeticao: number) => `/acompanhar/${idCompeticao}`;

export const enderecoPublicoDaPartida = (idCompeticao: number, idPartida: number) =>
    `${enderecoPublicoDaCompeticao(idCompeticao)}/partida/${idPartida}`;

const ContextoDaVisaoPublica = createContext(false);

/**
 * As telas públicas reaproveitam a classificação, a chave e as listas da
 * gestão. Dentro deste provedor elas apontam os links para o acompanhamento e
 * escondem o que é de quem organiza — o atalho para a Estrutura, a página da
 * equipe —, em vez de duplicar cada componente numa versão "só leitura".
 */
export const ProvedorDaVisaoPublica = ({ children }: { children: React.ReactNode }) => (
    <ContextoDaVisaoPublica.Provider value={true}>{children}</ContextoDaVisaoPublica.Provider>
);

export const useVisaoPublica = () => useContext(ContextoDaVisaoPublica);

/** Por onde ler da API: as rotas públicas só respondem competição aberta. */
export const useAcesso = (): Acesso => (useVisaoPublica() ? "publico" : "gestao");

export const useEnderecoDaPartida = () => {
    const publica = useVisaoPublica();
    return (idCompeticao: number, idPartida: number) =>
        publica
            ? enderecoPublicoDaPartida(idCompeticao, idPartida)
            : `/competicao/${idCompeticao}/partida/${idPartida}`;
};
