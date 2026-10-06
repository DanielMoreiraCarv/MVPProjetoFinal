"use client";

import { useParams } from "next/navigation";

import {
    CabecalhoDaPagina,
    CorpoDaPagina,
    migalhasDaCompeticao,
} from "@/src/components/layout/CabecalhoDaPagina";
import { ClassificacaoPorFase } from "@/src/features/fases/ClassificacaoPorFase";
import { useEscopo } from "@/src/lib/escopo";

/**
 * A classificação fase a fase. É o mesmo componente da aba da visão geral: as
 * duas telas não podem discordar sobre a mesma competição.
 */
const ClassificacaoPage = () => {
    const params = useParams<{ id: string }>();
    const idCompeticao = Number(params?.id);
    const { atual } = useEscopo();

    return (
        <>
            <CabecalhoDaPagina
                conceito="classificacao"
                titulo="Classificação"
                descricao="Fase a fase: tabela nas fases de pontos, chave na eliminatória."
                migalhas={migalhasDaCompeticao(atual)}
            />
            <CorpoDaPagina>
                <ClassificacaoPorFase idCompeticao={idCompeticao} />
            </CorpoDaPagina>
        </>
    );
};

export default ClassificacaoPage;
