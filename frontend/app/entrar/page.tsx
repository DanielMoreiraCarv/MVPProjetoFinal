import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AlternarTema } from "@/src/components/AlternarTema";
import { FormularioDeEntrada } from "@/src/features/acesso/FormularioDeEntrada";
import { MarcaDoApp } from "@/src/features/acompanhamento/CascaPublica";

export const metadata = { title: "Entrar · Meu Torneio" };

const EntrarPage = async ({ searchParams }: { searchParams: Promise<{ de?: string | string[] }> }) => {
    const { de } = await searchParams;

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
                <MarcaDoApp />
                <AlternarTema compacto />
            </header>

            <main className="flex flex-1 items-center justify-center px-5 py-10">
                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
                        <p className="text-sm text-muted-foreground">
                            Área da organização: competições, partidas e súmulas.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-border bg-card px-5 py-6 sm:px-6">
                        <FormularioDeEntrada de={typeof de === "string" ? de : undefined} />
                    </div>
                    <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
                        <ArrowLeft />
                        Voltar para o início
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default EntrarPage;
