import { cn } from "@/lib/utils";

/**
 * O nome do app na mesma letra do emblema. Peso normal: a fonte só tem um, e
 * pedir negrito faria o navegador engrossar as letras à força.
 */
export const NomeDoApp = ({ className }: { className?: string }) => (
    <span className={cn("whitespace-nowrap font-marca text-base font-normal leading-none", className)}>Meu Torneio</span>
);

/**
 * A marca do app. A fonte de placar fica só aqui: é o que separa o emblema do
 * monograma da competição escolhida, que usa o mesmo verde e antes tinha a
 * mesma cara.
 */
export const Emblema = ({ className }: { className?: string }) => (
    <span
        aria-hidden
        className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary font-marca text-[15px] font-normal leading-none text-sidebar-primary-foreground",
            className,
        )}
    >
        MT
    </span>
);
