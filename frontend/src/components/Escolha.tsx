"use client";

import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Opcao = { valor: string; rotulo: string };

/**
 * Escolher um entre muitos. Botões lado a lado servem para duas ou três
 * opções curtas; com seis modalidades eles cortavam "Futebol de campo" ao
 * meio, e o `<select>` nativo trazia a seta e o fundo do sistema operacional
 * para dentro do formulário.
 */
export const Escolha = ({
    id,
    valor,
    aoMudar,
    opcoes,
    vazio = "Escolha…",
    desabilitado,
    invalido,
    className,
}: {
    id?: string;
    valor: string;
    aoMudar: (valor: string) => void;
    opcoes: Opcao[];
    vazio?: string;
    desabilitado?: boolean;
    invalido?: boolean;
    className?: string;
}) => (
    <Select
        items={opcoes.map((opcao) => ({ value: opcao.valor, label: opcao.rotulo }))}
        value={valor || null}
        onValueChange={(novo) => aoMudar((novo as string | null) ?? "")}
        disabled={desabilitado}
    >
        <SelectTrigger id={id} aria-invalid={invalido} className={className}>
            <SelectValue placeholder={vazio} className="truncate data-placeholder:text-muted-foreground" />
        </SelectTrigger>
        <SelectPopup className="max-h-72 min-w-(--anchor-width) overflow-y-auto">
            {opcoes.map((opcao) => (
                <SelectItem key={opcao.valor} value={opcao.valor}>
                    {opcao.rotulo}
                </SelectItem>
            ))}
        </SelectPopup>
    </Select>
);
