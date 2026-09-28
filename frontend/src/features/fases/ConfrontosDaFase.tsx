"use client";

import { AlertTriangle, Check, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro } from "@/src/components/estado/Estados";
import { ValidacaoDaFase, gerarConfrontosDaFase, validarFase } from "@/src/lib/api/fases";
import { useAvisos } from "@/src/lib/avisos";

/**
 * O portão antes de gerar os confrontos.
 *
 * Quem decide se a fase pode ser montada é o servidor — ele conhece a
 * estratégia e a entrada. A tela mostra a lista de motivos como ela vem
 * ("informe exatamente um entre numeroDeGrupos e tamanhoDoGrupo") em vez de
 * um "não foi possível" que não diz o que corrigir.
 */
export const ConfrontosDaFase = ({
    idFase,
    /** Muda quando a configuração é gravada: a validação precisa ser refeita. */
    versaoDaConfiguracao = 0,
    aoGerar,
}: {
    idFase: number;
    versaoDaConfiguracao?: number;
    aoGerar?: () => void;
}) => {
    const avisos = useAvisos();

    const [validacao, setValidacao] = useState<ValidacaoDaFase | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [gerando, setGerando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    const conferir = useCallback(() => {
        setCarregando(true);
        setErro(null);
        validarFase(idFase)
            .then(setValidacao)
            .catch(setErro)
            .finally(() => setCarregando(false));
    }, [idFase]);

    useEffect(conferir, [conferir, versaoDaConfiguracao]);

    const gerar = async () => {
        setGerando(true);
        try {
            const quantos = await gerarConfrontosDaFase(idFase);
            avisos.sucesso(
                quantos === 1 ? "1 confronto gerado." : `${quantos} confrontos gerados.`,
            );
            aoGerar?.();
            conferir();
        } catch (causa) {
            avisos.erro(causa);
        } finally {
            setGerando(false);
        }
    };

    if (erro) return <Erro causa={erro} aoTentarDeNovo={conferir} />;
    if (carregando) return <CarregandoLista linhas={2} />;
    if (!validacao) return null;

    return (
        <div className="space-y-4 rounded-3xl border border-border bg-card px-5 py-4">
            {validacao.valido ? (
                <p className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-success" />
                    <span>A fase está pronta para ser montada.</span>
                </p>
            ) : (
                <div className="space-y-2 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                            {validacao.erros.length === 1
                                ? "Falta uma coisa para montar a fase"
                                : `Faltam ${validacao.erros.length} coisas para montar a fase`}
                        </span>
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {validacao.erros.map((motivo) => (
                            <li key={motivo}>{motivo}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={conferir}>
                    <RotateCw />
                    Conferir de novo
                </Button>
                <Confirmacao
                    gatilho={
                        <Button size="sm" disabled={!validacao.valido || gerando}>
                            {gerando ? "Gerando…" : "Gerar confrontos"}
                        </Button>
                    }
                    titulo="Gerar os confrontos desta fase?"
                    // Diz o que se perde: os confrontos anteriores da fase são
                    // substituídos, e com eles os placares já lançados.
                    descricao="Os confrontos que esta fase já tinha são substituídos, junto com os placares lançados neles. As outras fases não são afetadas."
                    rotuloDaAcao="Gerar confrontos"
                    aoConfirmar={gerar}
                />
            </div>
        </div>
    );
};
