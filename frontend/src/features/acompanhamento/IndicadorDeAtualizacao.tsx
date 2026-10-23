"use client";

import { RotateCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INTERVALO_DO_AO_VIVO_MS } from "@/src/lib/useAtualizacaoPeriodica";

const HORA = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
});

/**
 * Diz de quando é o que está na tela. Num placar ao vivo, número sem horário
 * é pior que número nenhum: ninguém sabe se o gol de agora já entrou.
 */
export const IndicadorDeAtualizacao = ({
    atualizadoEm,
    atualizando,
    falhou,
    ativa,
    aoAtualizar,
    className,
}: {
    atualizadoEm: Date | null;
    atualizando: boolean;
    falhou: boolean;
    /** Desligada quando nada mais muda — partida encerrada. */
    ativa: boolean;
    aoAtualizar: () => void;
    className?: string;
}) => (
    <div
        role="status"
        aria-live="polite"
        className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
    >
        {falhou ? (
            <span className="flex items-center gap-1.5 text-destructive">
                <WifiOff className="size-3.5" />
                Sem conexão — tentando de novo
            </span>
        ) : (
            <span>
                {atualizadoEm ? `Atualizado às ${HORA.format(atualizadoEm)}` : "Carregando…"}
                {ativa && ` · atualiza a cada ${INTERVALO_DO_AO_VIVO_MS / 1000} s`}
            </span>
        )}
        <Button
            variant="ghost"
            size="icon-xs"
            onClick={aoAtualizar}
            disabled={atualizando}
            aria-label="Atualizar agora"
            title="Atualizar agora"
        >
            <RotateCw className={cn(atualizando && "animate-spin")} />
        </Button>
    </div>
);
