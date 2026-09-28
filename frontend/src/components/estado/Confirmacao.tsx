"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Diálogo obrigatório antes de toda ação destrutiva — excluir, encerrar,
 * remover da competição.
 *
 * O texto do botão repete o verbo da ação ("Excluir competição"), nunca "OK":
 * na hora de confirmar, quem lê precisa ver o que vai acontecer, não
 * concordar com uma pergunta que já rolou para fora da vista.
 *
 *     <Confirmacao
 *         gatilho={<Button variant="destructive">Excluir</Button>}
 *         titulo="Excluir a competição?"
 *         descricao="As 78 partidas e a classificação vão junto. Não dá para desfazer."
 *         rotuloDaAcao="Excluir competição"
 *         aoConfirmar={() => removerCompeticao(id)}
 *     />
 */
export const Confirmacao = ({
    gatilho,
    titulo,
    descricao,
    rotuloDaAcao,
    aoConfirmar,
    destrutiva = true,
}: {
    gatilho: React.ReactNode;
    titulo: string;
    descricao?: string;
    rotuloDaAcao: string;
    aoConfirmar: () => void | Promise<void>;
    destrutiva?: boolean;
}) => {
    const [aberto, setAberto] = useState(false);
    const [executando, setExecutando] = useState(false);

    const confirmar = async () => {
        setExecutando(true);
        try {
            await aoConfirmar();
            setAberto(false);
        } finally {
            setExecutando(false);
        }
    };

    return (
        <AlertDialog.Root open={aberto} onOpenChange={setAberto}>
            <AlertDialog.Trigger render={gatilho as React.ReactElement} />
            <AlertDialog.Portal>
                <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-scrim supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
                <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-4xl bg-popover p-6 text-popover-foreground shadow-xl outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                    <div className="space-y-1.5">
                        <AlertDialog.Title className="font-heading text-base font-medium">
                            {titulo}
                        </AlertDialog.Title>
                        {descricao && (
                            <AlertDialog.Description className="text-sm text-muted-foreground">
                                {descricao}
                            </AlertDialog.Description>
                        )}
                    </div>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <AlertDialog.Close render={<Button variant="outline" />}>
                            Cancelar
                        </AlertDialog.Close>
                        <Button
                            variant={destrutiva ? "destructive" : "default"}
                            disabled={executando}
                            onClick={confirmar}
                            className={cn(executando && "opacity-70")}
                        >
                            {executando ? "Aguarde…" : rotuloDaAcao}
                        </Button>
                    </div>
                </AlertDialog.Popup>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
};
