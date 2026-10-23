import type { Metadata } from "next";
import { Geist_Mono, Inter, Racing_Sans_One } from "next/font/google";

import "./globals.css";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { SCRIPT_DO_TEMA } from "@/src/lib/tema";

// Uma família para texto. A mono existe para número em coluna — placar,
// classificação — onde dígito de largura variável faz a coluna dançar.
const inter = Inter({ subsets: ["latin"], variable: "--fonte-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--fonte-mono" });
// Só para o emblema: a letra de placar que dá cara ao "MT".
const racingSansOne = Racing_Sans_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--fonte-marca",
});

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
            className={cn("h-full", inter.variable, geistMono.variable, racingSansOne.variable)}
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: SCRIPT_DO_TEMA }} />
            </head>
            <body className="min-h-svh">
                <ToastProvider>
                    {children}
                    <ToastViewport className="print:hidden" />
                </ToastProvider>
            </body>
        </html>
    );
}
