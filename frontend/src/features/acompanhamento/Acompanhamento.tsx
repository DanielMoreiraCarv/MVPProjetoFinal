"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CarregandoCartoes, Erro, Vazio } from "@/src/components/estado/Estados";
import { CascaPublica } from "@/src/features/acompanhamento/CascaPublica";
import { ApiError } from "@/src/lib/api/client";
import { buscarCompeticao } from "@/src/lib/api/competicoes";
import { Competicao } from "@/src/lib/types/competicao";
import { ProvedorDaVisaoPublica } from "@/src/lib/visao-publica";

const ContextoDoAcompanhamento = createContext<Competicao | null>(null);

/** A competição aberta ao público em que a página está. */
export const useCompeticaoAcompanhada = () => {
    const competicao = useContext(ContextoDoAcompanhamento);
    if (!competicao) {
        throw new Error("useCompeticaoAcompanhada precisa estar dentro do Acompanhamento");
    }
    return competicao;
};

const Barreira = ({ titulo, descricao }: { titulo: string; descricao: string }) => (
    <Vazio
        conceito="competicao"
        titulo={titulo}
        descricao={descricao}
        acao={
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/" />}>
                <ArrowLeft />
                Ir para o início
            </Button>
        }
    />
);

/**
 * A porta das telas públicas. A competição carrega uma vez para o layout
 * inteiro, e só passa daqui a que a organização abriu ao público.
 *
 * Quem barra é o servidor: a rota pública responde 404 para competição
 * fechada e para inexistente, sem dizer qual das duas — por isso a tela
 * também não distingue.
 */
export const Acompanhamento = ({
    idCompeticao,
    children,
}: {
    idCompeticao: number;
    children: React.ReactNode;
}) => {
    const [competicao, setCompeticao] = useState<Competicao | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = useCallback(() => {
        if (!Number.isFinite(idCompeticao)) {
            setCarregando(false);
            return;
        }
        setCarregando(true);
        setErro(null);
        buscarCompeticao(idCompeticao, "publico")
            .then(setCompeticao)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idCompeticao]);

    useEffect(carregar, [carregar]);

    const naoEncontrada =
        !Number.isFinite(idCompeticao) || (erro instanceof ApiError && erro.status === 404);

    let corpo: React.ReactNode;
    if (carregando) {
        corpo = <CarregandoCartoes cartoes={3} />;
    } else if (naoEncontrada) {
        corpo = (
            <Barreira
                titulo="Competição indisponível"
                descricao="Ela não existe ou não está aberta ao público. Se recebeu o link da organização, peça para abrirem a competição."
            />
        );
    } else if (erro) {
        corpo = <Erro causa={erro} aoTentarDeNovo={carregar} />;
    }

    if (corpo || !competicao) {
        return (
            <CascaPublica>
                <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">{corpo}</div>
            </CascaPublica>
        );
    }

    return (
        <ContextoDoAcompanhamento.Provider value={competicao}>
            <ProvedorDaVisaoPublica>
                <CascaPublica competicao={competicao}>{children}</CascaPublica>
            </ProvedorDaVisaoPublica>
        </ContextoDoAcompanhamento.Provider>
    );
};
