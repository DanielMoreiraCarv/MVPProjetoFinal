import { cn } from "@/lib/utils";

const CONECTIVOS = new Set(["de", "da", "do", "das", "dos", "e"]);

/** "Futebol Fundamental II - Masculino" → "FF". */
export const iniciais = (nome: string) =>
    nome
        .split(/[\s\-–·]+/)
        .filter((palavra) => palavra && !CONECTIVOS.has(palavra.toLowerCase()))
        .slice(0, 2)
        .map((palavra) => palavra[0].toUpperCase())
        .join("");

/**
 * Identifica uma instância, não um conceito: o ícone diz "isto é uma
 * competição", o monograma diz "é esta competição". Usar o ícone do conceito
 * para as duas coisas punha o mesmo troféu quatro vezes no menu.
 */
export const Monograma = ({
    nome,
    destacado = false,
    className,
}: {
    nome: string;
    destacado?: boolean;
    className?: string;
}) => (
    <span
        aria-hidden
        className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tracking-tight",
            destacado
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "bg-muted text-muted-foreground",
            className,
        )}
    >
        {iniciais(nome)}
    </span>
);
