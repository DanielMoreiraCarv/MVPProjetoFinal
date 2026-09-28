"use client";

import { usePathname } from "next/navigation";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { listarAdministracoes } from "@/src/lib/api/administracoes";
import { listarCompeticoes } from "@/src/lib/api/competicoes";
import { Administracao } from "@/src/lib/types/administracao";
import { Competicao } from "@/src/lib/types/competicao";

const CHAVE_ULTIMO_ESCOPO = "tcc.escopo.ultimo";

/** Uma competição com o nome da administração a que pertence, já resolvido. */
export type CompeticaoComAdministracao = Competicao & {
    nomeDaAdministracao: string;
};

type Escopo = {
    competicoes: CompeticaoComAdministracao[];
    administracoes: Administracao[];
    carregando: boolean;
    erro: unknown;
    recarregar: () => void;
    /** A competição da rota atual, ou null fora de uma rota de competição. */
    atual: CompeticaoComAdministracao | null;
    /** Onde a pessoa estava da última vez, para a raiz do app saber voltar. */
    ultimoId: number | null;
    paletaAberta: boolean;
    abrirPaleta: () => void;
    fecharPaleta: () => void;
};

const ContextoDeEscopo = createContext<Escopo | null>(null);

/**
 * O escopo mora na URL — as rotas da competição são `/competicao/[id]/...` e
 * o seletor apenas navega.
 *
 * Isso mantém uma fonte de verdade só, deixa qualquer tela compartilhável por
 * link e sobrevive ao recarregar. O `localStorage` guarda o último escopo para
 * uma coisa só: a raiz do app saber para onde voltar.
 */
export const ProvedorDeEscopo = ({ children }: { children: React.ReactNode }) => {
    const caminho = usePathname() ?? "/";
    const [competicoes, setCompeticoes] = useState<CompeticaoComAdministracao[]>([]);
    const [administracoes, setAdministracoes] = useState<Administracao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);
    const [paletaAberta, setPaletaAberta] = useState(false);
    const [ultimoId, setUltimoId] = useState<number | null>(null);

    const carregar = useCallback(() => {
        setCarregando(true);
        setErro(null);
        Promise.all([listarCompeticoes(), listarAdministracoes()])
            .then(([todasCompeticoes, todasAdministracoes]) => {
                const nomePorId = new Map(todasAdministracoes.map((a) => [a.id, a.nome]));
                setAdministracoes(todasAdministracoes);
                setCompeticoes(
                    todasCompeticoes.map((competicao) => ({
                        ...competicao,
                        nomeDaAdministracao:
                            (competicao.idAdministracao != null
                                ? nomePorId.get(competicao.idAdministracao)
                                : undefined) ?? "Sem administração",
                    })),
                );
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, []);

    useEffect(carregar, [carregar]);

    useEffect(() => {
        const salvo = Number(localStorage.getItem(CHAVE_ULTIMO_ESCOPO));
        if (Number.isFinite(salvo) && salvo > 0) setUltimoId(salvo);
    }, []);

    const idNaRota = useMemo(() => {
        const achado = /^\/competicao\/(\d+)(?:\/|$)/.exec(caminho);
        return achado ? Number(achado[1]) : null;
    }, [caminho]);

    const atual = useMemo(
        () => competicoes.find((competicao) => competicao.id === idNaRota) ?? null,
        [competicoes, idNaRota],
    );

    useEffect(() => {
        if (idNaRota == null) return;
        localStorage.setItem(CHAVE_ULTIMO_ESCOPO, String(idNaRota));
        setUltimoId(idNaRota);
    }, [idNaRota]);

    // ⌘K / Ctrl+K de qualquer lugar. Fora de campo de texto, para não roubar
    // o atalho de quem está digitando.
    useEffect(() => {
        const aoTeclar = (evento: KeyboardEvent) => {
            if (evento.key.toLowerCase() !== "k" || !(evento.metaKey || evento.ctrlKey)) return;
            const alvo = evento.target as HTMLElement | null;
            if (alvo?.closest("input, textarea, [contenteditable=true]")) return;
            evento.preventDefault();
            setPaletaAberta((aberta) => !aberta);
        };
        window.addEventListener("keydown", aoTeclar);
        return () => window.removeEventListener("keydown", aoTeclar);
    }, []);

    const valor = useMemo<Escopo>(
        () => ({
            competicoes,
            administracoes,
            carregando,
            erro,
            recarregar: carregar,
            atual,
            ultimoId,
            paletaAberta,
            abrirPaleta: () => setPaletaAberta(true),
            fecharPaleta: () => setPaletaAberta(false),
        }),
        [competicoes, administracoes, carregando, erro, carregar, atual, ultimoId, paletaAberta],
    );

    return <ContextoDeEscopo.Provider value={valor}>{children}</ContextoDeEscopo.Provider>;
};

export const useEscopo = () => {
    const escopo = useContext(ContextoDeEscopo);
    if (!escopo) {
        throw new Error("useEscopo precisa estar dentro do ProvedorDeEscopo");
    }
    return escopo;
};

/**
 * Compara ignorando acento e caixa: quem procura "colegio sao joao" tem que
 * achar "Colégio São João". Sem isto a busca só serve para quem digita com
 * acento, que não é como se procura com pressa.
 */
export const normalizar = (texto: string) =>
    texto
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();
