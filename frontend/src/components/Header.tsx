import Link from "next/link";

import { AlternarTema } from "@/src/components/AlternarTema";

// Provisório: o menu lateral que substitui esta barra vem na entrega seguinte.
// Aqui a barra só deixa de ter cor fora dos tokens e ganha a alternância de
// tema, para dar como conferir os dois temas em qualquer tela.
const Header = () => {
    return (
        <header className="flex items-center gap-6 w-full border-b border-border bg-card px-5 py-3">
            <Link
                href="/"
                className="font-semibold text-base tracking-tight hover:text-primary transition-colors"
            >
                Meu Torneio
            </Link>
            <nav className="flex items-center gap-5 text-sm">
                <Link
                    href="/administracoes"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Administrações
                </Link>
                <Link
                    href="/tokens"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Tokens
                </Link>
            </nav>
            <div className="flex-1" />
            <AlternarTema />
        </header>
    );
};

export default Header;
