import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/src/components/Header";
import { SCRIPT_DO_TEMA } from "@/src/lib/tema";

// Uma família para texto. A mono existe para número em coluna — placar,
// classificação — onde dígito de largura variável faz a coluna dançar.
const inter = Inter({ subsets: ["latin"], variable: "--fonte-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--fonte-mono" });

export const metadata: Metadata = {
    title: "Meu Torneio",
    description: "Gestão de competições esportivas amadoras",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="pt-br"
            // O script abaixo mexe na classe do <html> antes da hidratação.
            suppressHydrationWarning
            className={cn("h-full", inter.variable, geistMono.variable)}
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: SCRIPT_DO_TEMA }} />
            </head>
            <body className="min-h-full flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col">{children}</main>
            </body>
        </html>
    );
}
